import React, { useMemo, useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Button } from "@/components/button";
import { Image } from "expo-image";
import { DateTime } from "luxon";
import { FontAwesome6 } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useStreakQuery } from "@/hooks/useStreakQuery";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";

interface StreakProps {
  currentStreak: number;
  maxStreak?: number;
  daysToNextLevel?: number;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const Streak = ({
  currentStreak,
  maxStreak = 0,
  daysToNextLevel = 0,
  onClose,
}: StreakProps) => {
  const { data: streakData, isLoading, error } = useStreakQuery();
  const { user } = useAuth();
  const [todayProgress, setTodayProgress] = useState<{ current: number; goal: number } | null>(null);

  const dayLabels = useMemo(() => ["S", "M", "T", "W", "T", "F", "S"], []);

  // Fetch today's protein progress to check if goal was hit
  useEffect(() => {
    const fetchTodayProgress = async () => {
      if (!user?.id) return;

      try {
        const today = DateTime.now().startOf("day").toISO();

        // Get today's meals and daily goal
        const [mealsResult, userResult] = await Promise.all([
          supabase
            .from("meals")
            .select("protein_amount")
            .eq("user_id", user.id)
            .gte("created_at", today),
          supabase
            .from("users")
            .select("daily_protein_target")
            .eq("id", user.id)
            .single()
        ]);

        if (mealsResult.data && userResult.data) {
          const currentProtein = mealsResult.data.reduce((sum, meal) => sum + (meal.protein_amount || 0), 0);
          const dailyGoal = userResult.data.daily_protein_target || 200;
          
          setTodayProgress({ current: currentProtein, goal: dailyGoal });
        }
      } catch (error) {
        console.error("Failed to fetch today's progress:", error);
      }
    };

    fetchTodayProgress();
  }, [user?.id]);

  // Use the current streak and max streak from real data
  const computedStreak = useMemo(() => {
    return streakData?.length || 0;
  }, [streakData]);

  const computedMaxStreak = useMemo(() => {
    return streakData?.maxStreak || maxStreak || 0;
  }, [streakData, maxStreak]);

  const getStreakMessage = () => {
    if (computedStreak === 0) return "Start your streak today!";
    if (computedStreak === 1) return "Great start! Keep it going!";
    if (computedStreak < 7) return "Building momentum!";
    if (computedStreak < 30) return "You're on fire!";
    return "Incredible dedication!";
  };

  const getStreakLevel = () => {
    if (computedStreak < 7) return "Beginner";
    if (computedStreak < 30) return "Consistent";
    if (computedStreak < 100) return "Dedicated";
    return "Master";
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/background.png")}
          style={styles.background}
          contentFit="cover"
        />
        <View style={[styles.content, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading your streak...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/background.png")}
          style={styles.background}
          contentFit="cover"
        />
        <View style={[styles.content, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Failed to load streak data</Text>
          <Button style={styles.closeButton} onPress={onClose} variant="primary">
            Close
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>protein ai</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{getStreakLevel()}</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400)}
          style={styles.streakDisplay}
        >
          <View style={styles.streakNumberContainer}>
            <View style={styles.streakNumberRow}>
              <Text style={styles.streakNumber}>{computedStreak}</Text>
              <FontAwesome6
                name="fire"
                size={60}
                color="#FF6B35"
                style={styles.fireIcon}
              />
            </View>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600)}
          style={styles.weekSection}
        >
          <View style={styles.weekRow}>
            {streakData?.dailyBreakdown.map((d, idx) => {
              const isToday = idx === (streakData?.dailyBreakdown.length || 0) - 1;
              
              // For today, use real-time progress if available
              const hitGoal = isToday && todayProgress 
                ? todayProgress.current >= todayProgress.goal 
                : d.hitGoal;
              
              const delay = 700 + idx * 100; // Staggered animation
              return (
                <Animated.View
                  key={d.date + idx}
                  entering={FadeInUp.delay(delay).springify()}
                  style={styles.dayItem}
                >
                  <Animated.View
                    style={[
                      styles.dayCircle,
                      hitGoal ? styles.dayHit : styles.dayMiss,
                      isToday && styles.todayCircle,
                    ]}
                  >
                    {hitGoal && (
                      <FontAwesome6 name="check" size={14} color="#FFFFFF" />
                    )}
                    {!hitGoal && !isToday && (
                      <FontAwesome6 name="xmark" size={12} color="#999999" />
                    )}
                  </Animated.View>
                  <Text
                    style={[
                      styles.dayLabel,
                      isToday && styles.todayLabel,
                      hitGoal && styles.dayLabelHit,
                    ]}
                  >
                    {dayLabels[DateTime.fromISO(d.date).weekday % 7]}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800)} style={styles.footer}>
          <Text style={styles.motivationalText}>
            {computedStreak > 0
              ? "Keep the momentum going!"
              : "Start your journey today!"}
          </Text>

          <Button
            style={styles.closeButton}
            onPress={onClose}
            variant="primary"
          >
            I'm committed!
          </Button>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  levelBadge: {
    backgroundColor: "#7FEA71",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  levelText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  streakDisplay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  streakNumberContainer: {
    alignItems: "center",
  },
  streakNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fireIcon: {
    marginTop: -8,
  },
  streakNumber: {
    fontSize: 72,
    fontFamily: "Platypi",
    color: "#FF6B35",
    fontWeight: "700",
    lineHeight: 72,
  },
  streakLabel: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#FF6B35",
    fontWeight: "500",
    marginTop: 4,
  },
  streakMessage: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    fontWeight: "500",
  },
  weekSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  subheading: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 20,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    gap: screenWidth > 400 ? 16 : Math.max(8, (screenWidth - 80) / 10),
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 320,
  },
  dayItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  dayCircle: {
    width: Math.min(40, Math.max(28, screenWidth / 12)),
    height: Math.min(40, Math.max(28, screenWidth / 12)),
    borderRadius: Math.min(20, Math.max(14, screenWidth / 24)),
    borderWidth: 2,
    borderColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  dayHit: {
    backgroundColor: "#7FEA71",
    borderColor: "#7FEA71",
  },
  dayMiss: {
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    borderColor: "#2A2A2A",
  },
  todayCircle: {
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayLabel: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontWeight: "500",
  },
  todayLabel: {
    color: "#2A2A2A",
    fontWeight: "600",
  },
  dayLabelHit: {
    color: "#7FEA71",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  motivationalText: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "500",
  },
  closeButton: {
    width: "100%",
    paddingVertical: 18,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
  },
});
