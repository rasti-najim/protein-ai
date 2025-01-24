import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import { Button } from "@/components/button";
import { usePostHog } from "posthog-react-native";
export default function Manual() {
  const { user } = useAuth();
  const [mealName, setMealName] = useState("");
  const [proteinAmount, setProteinAmount] = useState("");
  const router = useRouter();
  const posthog = usePostHog();
  const handleSave = async () => {
    // TODO: Save the meal
    try {
      await supabase.from("meals").insert({
        name: mealName,
        protein_amount: Number(proteinAmount),
        user_id: user?.id!,
        created_at: DateTime.now().toISO(),
      });
      posthog.capture("user_entered_manually", {
        meal_name: mealName,
        protein_amount: Number(proteinAmount),
      });
      router.dismiss();
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  };

  const isValid = mealName.trim() !== "" && !isNaN(Number(proteinAmount));

  // if (!user) {
  //   return <Redirect href="/login" />;
  // }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Add Meal</Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={100}
          style={styles.content}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              style={styles.input}
              value={mealName}
              onChangeText={setMealName}
              placeholder="e.g. Chicken Breast"
              placeholderTextColor="#666666"
            />

            <Text style={styles.label}>Protein Amount (g)</Text>
            <TextInput
              style={styles.input}
              value={proteinAmount}
              onChangeText={setProteinAmount}
              placeholder="e.g. 30"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Save</Text>
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
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
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(42, 42, 42, 0.05)",
    borderRadius: 16,
    padding: 16,
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  buttonContainer: {
    marginTop: "auto",
  },
  button: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
