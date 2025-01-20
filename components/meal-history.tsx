import { View, Text, StyleSheet, FlatList } from "react-native";
import { DateTime } from "luxon";
import { useState, useCallback, useEffect } from "react";
import supabase from "@/lib/supabase";
import { FlashList } from "@shopify/flash-list";

interface MealsByDate {
  [date: string]: {
    id: string;
    name: string;
    protein_amount: number;
    created_at: string;
  }[];
}

interface MealHistoryProps {
  userId: string;
}

export const MealHistory = ({ userId }: MealHistoryProps) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [dates, setDates] = useState<string[]>([]);
  const [groupedMeals, setGroupedMeals] = useState<MealsByDate>({});

  const fetchHistory = async (page = 1, limit = 20) => {
    console.log("Fetching history for page:", page);
    const { data: history, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    console.log("Fetched meals:", history);

    const grouped = (history as any[]).reduce((acc: MealsByDate, meal) => {
      const date = DateTime.fromISO(meal.created_at).toFormat("yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(meal);
      return acc;
    }, {});

    console.log("Grouped meals:", grouped);
    return grouped;
  };

  const loadMoreMeals = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newMeals = await fetchHistory(page);
      const newDates = Object.keys(newMeals);

      setDates((prev) => [...prev, ...newDates]);
      setGroupedMeals((prev) => ({ ...prev, ...newMeals }));
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading meals:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, userId]);

  const renderDateGroup = ({ item: date }: { item: string }) => {
    console.log("Rendering date group:", date, groupedMeals[date]);
    const meals = groupedMeals[date];
    if (!meals) return null; // Add safety check

    const mealDate = DateTime.fromISO(date);
    const now = DateTime.now();
    const diff = now.startOf("day").diff(mealDate.startOf("day"), "days").days;

    let displayDate;
    if (diff === 0) displayDate = "Today";
    else if (diff === 1) displayDate = "Yesterday";
    else if (diff < 7) displayDate = mealDate.toFormat("cccc");
    else displayDate = mealDate.toFormat("cccc, MMM d");

    return (
      <View style={styles.dateGroup}>
        <Text style={styles.historyDate}>{displayDate}</Text>
        {meals.map((meal, index) => (
          <View key={index} style={styles.mealItem}>
            <Text style={styles.mealText}>
              {meal.name} ({meal.protein_amount}g)
            </Text>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    loadMoreMeals();
  }, []);

  return (
    <FlatList
      data={dates}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      renderItem={renderDateGroup}
      keyExtractor={(date: string) => {
        const meals = groupedMeals[date];
        return meals?.[0]?.id || date;
      }}
      onEndReached={loadMoreMeals}
      onEndReachedThreshold={0.5}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 200,
  },
  dateGroup: {
    gap: 8,
    marginBottom: 32,
  },
  historyDate: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  mealItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 42, 42, 0.1)",
  },
  mealText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
});
