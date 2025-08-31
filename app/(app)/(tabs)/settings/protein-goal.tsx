import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/components/auth-context";
import supabase from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";

interface UserData {
  daily_protein_target: number;
  target_weight: number;
  target_weight_unit: "lbs" | "kg";
  exercise_frequency: "0-2" | "3-4" | "5+";
}

export default function ModifyProteinGoal() {
  const { user } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();
  const [proteinGoal, setProteinGoal] = useState("");
  const [currentGoal, setCurrentGoal] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchCurrentGoal = async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "daily_protein_target, target_weight, target_weight_unit, exercise_frequency"
        )
        .eq("id", user?.id!)
        .single();

      if (data) {
        setUserData(data);
        setCurrentGoal(data.daily_protein_target);
        setProteinGoal(data.daily_protein_target.toString());
      }
    };

    fetchCurrentGoal();
  }, [user?.id]);

  const calculateSuggestedProtein = () => {
    if (!userData) return 0;

    let weightInPounds = userData.target_weight;
    if (userData.target_weight_unit === "kg") {
      weightInPounds = userData.target_weight * 2.20462;
    }

    let multiplier = 0.73; // Default for 0-2
    if (userData.exercise_frequency === "3-4") {
      multiplier = 0.91;
    } else if (userData.exercise_frequency === "5+") {
      multiplier = 1.0;
    }

    return Math.round(weightInPounds * multiplier);
  };

  const suggestedProtein = calculateSuggestedProtein();

  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newGoal = parseInt(proteinGoal);
      if (isNaN(newGoal) || newGoal < 1) return;

      await supabase
        .from("users")
        .update({ daily_protein_target: newGoal })
        .eq("id", user?.id);

      posthog.capture("user_updated_protein_goal", {
        old_goal: currentGoal,
        new_goal: newGoal,
      });

      router.back();
    } catch (error) {
      console.error("Error updating protein goal:", error);
    }
  };

  const isValid = !isNaN(parseInt(proteinGoal)) && parseInt(proteinGoal) > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.title}>Modify Protein Goal</Text>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.content}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Daily Protein Goal (g)</Text>
              <TextInput
                style={styles.input}
                value={proteinGoal}
                onChangeText={setProteinGoal}
                placeholder="Enter protein goal"
                placeholderTextColor="rgba(51, 51, 51, 0.7)"
                keyboardType="numeric"
              />
              <Text style={styles.currentGoal}>
                Current goal: {currentGoal}g protein per day
              </Text>
              {userData && (
                <Text style={styles.suggestion}>
                  Suggested goal based on your profile: {suggestedProtein}g
                  protein per day
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fae5d2",
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 42,
    color: "#333333",
    fontWeight: "700",
    marginBottom: 40,
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    gap: 16,
  },
  label: {
    fontSize: 20,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(51, 51, 51, 0.05)",
    borderRadius: 16,
    padding: 16,
    fontSize: 20,
    color: "#333333",
  },
  currentGoal: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.7)",
    fontStyle: "italic",
  },
  suggestion: {
    fontSize: 16,
    color: "#4CAF50",
    fontStyle: "italic",
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "#fae5d2",
    fontSize: 20,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
