import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
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

  const saveOnboardingData = async () => {
    console.log("saving onboarding data", onboardingData);

    try {
      // Try to upsert (insert or update) user data to handle existing users
      const { data, error } = await supabase.from("users").upsert({
        id: user?.id,
        email: onboardingData.email,
        gender: onboardingData.gender,
        target_weight: onboardingData.targetWeight,
        target_weight_unit: onboardingData.targetWeightUnit,
        exercise_frequency: onboardingData.exerciseFrequency,
        goal: onboardingData.goal,
        daily_protein_target: onboardingData.dailyProteinGoal,
      }, {
        onConflict: 'id'
      });

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
  };

  useEffect(() => {
    saveOnboardingData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/images/steak-dark.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>Protein AI</Text>

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
              color="#FCE9BC"
            />
          </Animated.View>
          <Text style={styles.loadingText}>Creating your profile...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginBottom: "50%",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
  },
});
