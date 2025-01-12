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

interface BarData {
  value: number;
  label: string;
  frontColor: string;
  labelTextStyle: StyleProp<TextStyle>;
}

export default function Progress() {
  const { user } = useAuth();
  const router = useRouter();
  const weeklyGoal = 154;
  const [barData, setBarData] = useState<BarData[]>([]);
  const [history, setHistory] = useState([]);
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  useEffect(() => {
    const fetchWeeklyMeals = async () => {
      const { data: weeklyMeals, error } = await supabase
        .from("weekly_meals_view")
        .select("*")
        .eq("user_id", user.id)
        .limit(7); // Get last 7 weeks

      if (error) {
        console.error("Error fetching weekly meals:", error);
        return;
      }

      if (weeklyMeals) {
        setBarData(
          weeklyMeals.map((week) => ({
            value: week.total_protein || 0,
            label: week.week_start || "",
            frontColor: "#A8D1FF",
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
        setHistory(history as any);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
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
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Progress</Text>

        <Text style={styles.sectionTitle}>This Week</Text>

        <View style={styles.chartContainer}>
          <View style={styles.goalLine}>
            <View style={styles.goalDash} />
            <Text style={styles.goalText}>{weeklyGoal}g</Text>
          </View>

          <BarChart
            data={barData}
            barWidth={24}
            spacing={16}
            roundedTop
            roundedBottom
            // hideRules
            xAxisThickness={1}
            xAxisColor="rgba(42, 42, 42, 0.1)"
            yAxisThickness={0}
            maxValue={200}
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
          {history.map((meal: any, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              // onPress={() => router.push(`/history/${date}`)}
            >
              <Text style={styles.historyDate}>
                {DateTime.fromISO(meal.created_at).toFormat("EEE, MMM d")}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={32}
                color="#2A2A2A"
              />
            </TouchableOpacity>
          ))}
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
    gap: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 42, 42, 0.1)",
  },
  historyDate: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
});
