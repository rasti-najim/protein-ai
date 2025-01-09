import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Manual() {
  const [mealName, setMealName] = useState("");
  const [proteinAmount, setProteinAmount] = useState("");
  const router = useRouter();

  const handleSave = () => {
    // TODO: Save the meal
    router.back();
  };

  const isValid = mealName.trim() !== "" && !isNaN(Number(proteinAmount));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Meal</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
