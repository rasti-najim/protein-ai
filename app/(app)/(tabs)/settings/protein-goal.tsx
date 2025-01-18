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
import { Image } from "expo-image";

export default function ModifyProteinGoal() {
  const { user } = useAuth();
  const router = useRouter();
  const [proteinGoal, setProteinGoal] = useState("");
  const [currentGoal, setCurrentGoal] = useState<number>(0);

  useEffect(() => {
    const fetchCurrentGoal = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("daily_protein_target")
        .eq("id", user?.id!)
        .single();

      if (data) {
        setCurrentGoal(data.daily_protein_target);
        setProteinGoal(data.daily_protein_target.toString());
      }
    };

    fetchCurrentGoal();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newGoal = parseInt(proteinGoal);
      if (isNaN(newGoal) || newGoal < 1) return;

      await supabase
        .from("users")
        .update({ daily_protein_target: newGoal })
        .eq("id", user?.id);

      router.back();
    } catch (error) {
      console.error("Error updating protein goal:", error);
    }
  };

  const isValid = !isNaN(parseInt(proteinGoal)) && parseInt(proteinGoal) > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Image
          source={require("@/assets/images/background.png")}
          style={styles.background}
          contentFit="cover"
        />
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
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
            <Text style={styles.currentGoal}>
              Current goal: {currentGoal}g protein per day
            </Text>
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
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
  currentGoal: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
