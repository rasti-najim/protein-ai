import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useCallback } from "react";
import { OnboardingData } from "@/app/onboarding";
import supabase from "@/lib/supabase";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "./auth-context";
import { usePostHog } from "posthog-react-native";

export const OnboardingLoading = ({
  onboardingData,
}: {
  onboardingData: OnboardingData;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { user } = useAuth();
  const posthog = usePostHog();

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    const rotate = Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    });

    Animated.parallel([Animated.loop(pulse), Animated.loop(rotate)]).start();
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const saveOnboardingData = useCallback(async () => {
    console.log("saving onboarding data", onboardingData);

    try {
      // Try to upsert (insert or update) user data to handle existing users
      const { data, error } = await supabase.from("users").upsert(
        [
          {
            id: user?.id,
            email: onboardingData.email || "",
            gender: onboardingData.gender || "other",
            target_weight: onboardingData.targetWeight || 0,
            target_weight_unit: onboardingData.targetWeightUnit || "lbs",
            exercise_frequency: onboardingData.exerciseFrequency || "0-2",
            goal: onboardingData.goal || "maintain",
            daily_protein_target: onboardingData.dailyProteinGoal || 0,
          },
        ],
        {
          onConflict: "id",
        }
      );

      if (error) throw error;

      console.log("Onboarding data saved successfully", data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      posthog.identify(user?.id, {
        email: onboardingData.email,
        gender: onboardingData.gender,
        target_weight: onboardingData.targetWeight,
        target_weight_unit: onboardingData.targetWeightUnit,
        exercise_frequency: onboardingData.exerciseFrequency,
        goal: onboardingData.goal,
        daily_protein_target: onboardingData.dailyProteinGoal,
      });
      posthog.capture("user_onboarded");
      router.replace("/(app)/(tabs)/home");
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      // Show error and allow retry or navigate to home anyway
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // For now, still navigate to home to not block the user
      // In production, you might want to show an error message and retry
      router.replace("/(app)/(tabs)/home");
    }
  }, [onboardingData, user?.id, posthog, router]);

  useEffect(() => {
    saveOnboardingData();
  }, [saveOnboardingData]);

  return (
    <View style={[styles.container, { backgroundColor: "#fae5d2" }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>Protein AI</Text>
            <Text style={styles.subtitle}>Almost ready!</Text>
          </View>

          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }, { rotate: spin }],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={48}
                color="#fae5d2"
              />
            </Animated.View>
            <Text style={styles.loadingText}>Creating your profile...</Text>
            <Text style={styles.loadingSubtext}>
              We're setting up your personalized protein plan
            </Text>
          </View>

          <View style={styles.footerSection} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  title: {
    fontSize: 52,
    color: "#333333",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(51, 51, 51, 0.8)",
    textAlign: "center",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 22,
    color: "#333333",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.7)",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  footerSection: {
    height: 60,
  },
});
