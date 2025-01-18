import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StyleProp,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { BarChart } from "react-native-gifted-charts";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import { Image } from "expo-image";

interface BarData {
  value: number;
  label: string;
  frontColor: string;
}

interface MealsByDate {
  [date: string]: {
    created_at: string;
    name: string;
    protein_amount: number;
  }[];
}

export default function Progress() {
  const { user } = useAuth();
  const router = useRouter();
  const [barData, setBarData] = useState<BarData[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<MealsByDate>({});
  const [goal, setGoal] = useState(0);
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      const { data: weeklyMeals, error } = await supabase
        .from("weekly_meals_view")
        .select("*")
        .eq("user_id", user.id)
        .limit(7);

      if (error) {
        console.error("Error fetching weekly meals:", error);
        return;
      }

      if (weeklyMeals) {
        setBarData(
          weeklyMeals.map((week, index) => ({
            value: week.total_protein || 0,
            label: DateTime.fromISO(week.week_start || "")
              .toFormat("ccc")
              .charAt(0),
            frontColor:
              index === 1 ? "#4A90E2" : index === 2 ? "#FF6B6B" : "#A8D1FF",
            labelTextStyle: styles.chartLabel,
          }))
        );
      }
    };
    fetchWeeklyMeals();
  }, [user?.id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: history, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group meals by date
        const grouped = (history as any[]).reduce((acc: MealsByDate, meal) => {
          const date = DateTime.fromISO(meal.created_at).toFormat("yyyy-MM-dd");
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(meal);
          return acc;
        }, {});

        setGroupedHistory(grouped);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchGoal = async () => {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .limit(1)
        .single();

      if (error) throw error;

      setGoal(userData.daily_protein_target);
    };
    fetchGoal();
  }, []);

  // const barData = [
  //   {
  //     value: 125,
  //     label: "S",
  //     frontColor: "#A8D1FF",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 163,
  //     label: "M",
  //     frontColor: "#4A90E2",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 73,
  //     label: "T",
  //     frontColor: "#FF6B6B",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 125,
  //     label: "W",
  //     frontColor: "#A8D1FF",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 125,
  //     label: "T",
  //     frontColor: "#A8D1FF",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 125,
  //     label: "F",
  //     frontColor: "#A8D1FF",
  //     labelTextStyle: styles.chartLabel,
  //   },
  //   {
  //     value: 125,
  //     label: "S",
  //     frontColor: "#A8D1FF",
  //     labelTextStyle: styles.chartLabel,
  //   },
  // ];

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Progress</Text>

        <Text style={styles.sectionTitle}>This Week</Text>

        <View style={styles.chartContainer}>
          <View style={styles.goalLine}>
            <View style={styles.goalDash} />
            <Text style={styles.goalText}>{goal}g</Text>
          </View>

          <BarChart
            data={barData}
            barWidth={22}
            // spacing={16}
            barBorderRadius={4}
            xAxisThickness={0}
            yAxisThickness={0}
            // maxValue={200}
            noOfSections={4}
            renderTooltip={(item: any) => (
              <View style={styles.proteinBadge}>
                <Text style={styles.proteinText}>{item.value}g</Text>
              </View>
            )}
          />
        </View>

        <Text style={styles.sectionTitle}>History</Text>

        <View style={styles.historyList}>
          {Object.entries(groupedHistory).map(([date, meals]) => {
            const mealDate = DateTime.fromISO(date);
            const now = DateTime.now();
            const diff = now
              .startOf("day")
              .diff(mealDate.startOf("day"), "days").days;

            let displayDate;
            if (diff === 0) {
              displayDate = "Today";
            } else if (diff === 1) {
              displayDate = "Yesterday";
            } else if (diff < 7) {
              displayDate = mealDate.toFormat("cccc"); // Full day name
            } else {
              displayDate = mealDate.toFormat("cccc, MMM d"); // Day name, Month Day
            }

            return (
              <View key={date} style={styles.dateGroup}>
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
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 24,
  },
  chartContainer: {
    height: 300,
    marginBottom: 40,
    paddingTop: 20,
  },
  goalLine: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 60,
    width: "100%",
    zIndex: 1,
  },
  goalDash: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A2A2A",
    opacity: 0.2,
    borderStyle: "dashed",
    borderWidth: 1,
  },
  goalText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    marginLeft: 8,
  },
  chartLabel: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  proteinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(42, 42, 42, 0.2)",
    backgroundColor: "#FCE9BC",
  },
  proteinText: {
    fontSize: 14,
    fontFamily: "Platypi",
    color: "#666666",
  },
  historyList: {
    gap: 32,
  },
  dateGroup: {
    gap: 8,
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
