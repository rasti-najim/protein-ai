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
            <View style={styles.mealInfo}>
              <Text
                style={styles.mealName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
              </Text>
              <View style={styles.proteinBadge}>
                <Text style={styles.proteinText}>{meal.protein_amount}g</Text>
              </View>
            </View>
            <Text style={styles.mealTime}>
              {DateTime.fromISO(meal.created_at).toFormat("h:mm a")}
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
    <FlashList
      data={dates}
      // initialNumToRender={10}
      // maxToRenderPerBatch={10}
      renderItem={renderDateGroup}
      keyExtractor={(date: string) => {
        const meals = groupedMeals[date];
        return meals?.[0]?.id || date;
      }}
      onEndReached={loadMoreMeals}
      onEndReachedThreshold={0.5}
      style={styles.list}
      estimatedItemSize={200}
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
    color: "#333333",
    fontWeight: "600",
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 51, 51, 0.1)",
  },
  mealInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  mealName: {
    fontSize: 20,
    color: "#333333",
    fontWeight: "500",
    flex: 1,
    lineHeight: 24,
  },
  proteinBadge: {
    backgroundColor: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proteinText: {
    fontSize: 16,
    color: "#fae5d2",
    fontWeight: "600",
  },
  mealTime: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.7)",
    flexShrink: 0,
  },
});
