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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";
import { Button } from "@/components/button";
import { usePostHog } from "posthog-react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
export default function Manual() {
  const { user } = useAuth();
  const [mealName, setMealName] = useState("");
  const [proteinAmount, setProteinAmount] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [entryMode, setEntryMode] = useState<'description' | 'manual'>('description');
  const router = useRouter();
  const posthog = usePostHog();

  const analyzeDescription = async () => {
    if (!mealDescription.trim()) return;
    
    setIsAnalyzing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-meal-description", {
        body: {
          description: mealDescription.trim(),
        },
      });

      if (error) {
        console.error("Error analyzing meal:", error);
        return;
      }

      if (data) {
        setMealName(data.meal_name || "");
        setProteinAmount(data.protein_g ? data.protein_g.toString() : "");
        setEntryMode('manual');
        posthog.capture("meal_description_analyzed", {
          description_length: mealDescription.length,
          meal_name: data.meal_name,
          protein_amount: data.protein_g,
        });
      }
    } catch (error) {
      console.error("Error analyzing meal description:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
  const canAnalyze = mealDescription.trim() !== "" && !isAnalyzing;

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
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                entryMode === 'description' && styles.toggleButtonActive,
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEntryMode('description');
              }}
            >
              <FontAwesome6 
                name="wand-magic-sparkles" 
                size={16} 
                color={entryMode === 'description' ? "#FCE9BC" : "#2A2A2A"} 
              />
              <Text style={[
                styles.toggleText,
                entryMode === 'description' && styles.toggleTextActive,
              ]}>
                Describe Meal
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                entryMode === 'manual' && styles.toggleButtonActive,
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEntryMode('manual');
              }}
            >
              <FontAwesome6 
                name="keyboard" 
                size={16} 
                color={entryMode === 'manual' ? "#FCE9BC" : "#2A2A2A"} 
              />
              <Text style={[
                styles.toggleText,
                entryMode === 'manual' && styles.toggleTextActive,
              ]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            {entryMode === 'description' ? (
              <>
                <Text style={styles.label}>Describe Your Meal</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={mealDescription}
                  onChangeText={setMealDescription}
                  placeholder="e.g. I had a grilled chicken breast with some rice and broccoli"
                  placeholderTextColor="#666666"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                
                <Button
                  style={[styles.analyzeButton, !canAnalyze && styles.buttonDisabled]}
                  onPress={analyzeDescription}
                  disabled={!canAnalyze}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator size="small" color="#FCE9BC" />
                  ) : (
                    <View style={styles.analyzeButtonContent}>
                      <FontAwesome6 name="star" size={16} color="#2A2A2A" />
                      <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                    </View>
                  )}
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Save Meal</Text>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: "#2A2A2A",
  },
  toggleText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#FCE9BC",
    fontWeight: "600",
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
    borderWidth: 2,
    borderColor: "transparent",
  },
  textArea: {
    minHeight: 120,
    maxHeight: 180,
  },
  analyzeButton: {
    backgroundColor: "#7FEA71",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: "auto",
  },
  button: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A2A2A",
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
