import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { BarChart } from "react-native-gifted-charts";
import { useEffect, useState, useCallback } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import { Image } from "expo-image";
import { MealHistory } from "@/components/meal-history";

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

const screenWidth = Dimensions.get("window").width;

export default function Progress() {
  const { user } = useAuth();
  const router = useRouter();
  const [barData, setBarData] = useState<BarData[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<MealsByDate>({});
  const [goal, setGoal] = useState(0);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(
    DateTime.now().startOf("week").toISO()
  );
  const [isFirstWeek, setIsFirstWeek] = useState(false);
  if (!user) {
    return <Redirect href="/welcome" />;
  }

  useEffect(() => {
    if (user) {
      fetchWeeklyMeals();
    }
  }, [user, selectedWeekStart]);

  useEffect(() => {
    const fetchHistory = async (page = 1, limit = 20) => {
      try {
        const { data: history, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

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

  const fetchWeeklyMeals = async () => {
    // Get the earliest meal date
    const { data: firstMeal } = await supabase
      .from("meals")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(1)
      .single();

    if (firstMeal) {
      const firstWeekStart = DateTime.fromISO(firstMeal.created_at).startOf(
        "week"
      );
      const currentWeekStart = DateTime.fromISO(selectedWeekStart);
      setIsFirstWeek(currentWeekStart <= firstWeekStart);
    }

    const weekStart = DateTime.fromISO(selectedWeekStart);
    const weekEnd = weekStart.plus({ days: 6 });

    const { data: meals, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISO())
      .lt("created_at", weekEnd.plus({ days: 1 }).toISO())
      .order("created_at");

    if (error) {
      console.error("Error fetching weekly meals:", error);
      return;
    }

    if (meals) {
      // Group meals by day and calculate daily totals
      const dailyTotals = meals.reduce(
        (acc: { [key: string]: number }, meal) => {
          const day = DateTime.fromISO(meal.created_at).toFormat("ccc");
          acc[day] = (acc[day] || 0) + meal.protein_amount;
          return acc;
        },
        {}
      );

      // Create bar data for each day of the week
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      setBarData(
        days.map((day) => ({
          value: dailyTotals[day] || 0,
          label: day,
          frontColor: (dailyTotals[day] || 0) >= goal ? "#7FEA71" : "#4A90E2",
          // labelTextStyle: styles.chartLabel,
        }))
      );
    }
  };

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

        <View style={styles.weekSelector}>
          <TouchableOpacity
            onPress={() => {
              if (!isFirstWeek) {
                const prevWeek = DateTime.fromISO(selectedWeekStart)
                  .minus({ weeks: 1 })
                  .toISO();
                setSelectedWeekStart(prevWeek);
              }
            }}
            style={[
              styles.weekButton,
              isFirstWeek && styles.weekButtonDisabled,
            ]}
            disabled={isFirstWeek}
          >
            <Text
              style={[
                styles.weekButtonText,
                isFirstWeek && styles.weekButtonTextDisabled,
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>

          <Text style={styles.weekLabel}>
            {DateTime.fromISO(selectedWeekStart).toFormat("MMM d")} -{" "}
            {DateTime.fromISO(selectedWeekStart)
              .plus({ days: 6 })
              .toFormat("MMM d")}
          </Text>

          <TouchableOpacity
            onPress={() => {
              const nextWeek = DateTime.fromISO(selectedWeekStart)
                .plus({ weeks: 1 })
                .toISO();
              const now = DateTime.now();
              if (DateTime.fromISO(nextWeek) <= now) {
                setSelectedWeekStart(nextWeek);
              }
            }}
            style={styles.weekButton}
          >
            <Text style={styles.weekButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          {/* <View style={styles.goalLine}>
            <View style={styles.goalDash} />
            <Text style={styles.goalText}>{goal}g</Text>
          </View> */}

          <BarChart
            data={barData}
            barWidth={22}
            spacing={16}
            barBorderRadius={4}
            xAxisThickness={0}
            yAxisThickness={0}
            noOfSections={4}
            maxValue={Math.ceil((goal * 2.5) / 10) * 10}
            width={screenWidth - 40}
            renderTooltip={(item: any) => (
              <View style={[styles.proteinBadge, { zIndex: 2 }]}>
                <Text style={styles.proteinText}>{item.value}g</Text>
              </View>
            )}
          />
        </View>

        <Text style={styles.sectionTitle}>History</Text>

        <MealHistory userId={user.id} />
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
  weekIndicator: {
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  weekButton: {
    padding: 8,
  },
  weekButtonText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  weekButtonDisabled: {
    opacity: 0.3,
  },
  weekButtonTextDisabled: {
    color: "#666666",
  },
});
