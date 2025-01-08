import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

interface ExerciseProps {
  onSelect: (frequency: "0-2" | "3-4" | "5+") => void;
}

export const Exercise = ({ onSelect }: ExerciseProps) => {
  const [selected, setSelected] = useState<"0-2" | "3-4" | "5+" | null>(null);

  const handleSelect = async (frequency: "0-2" | "3-4" | "5+") => {
    await Haptics.selectionAsync();
    setSelected(frequency);
    onSelect(frequency);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise</Text>
      <Text style={styles.subtitle}>
        How many times a week{"\n"}do you workout?
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, selected === "0-2" && styles.selectedOption]}
          onPress={() => handleSelect("0-2")}
        >
          <Text
            style={[
              styles.optionText,
              selected === "0-2" && styles.optionTextSelected,
            ]}
          >
            0-2
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, selected === "3-4" && styles.selectedOption]}
          onPress={() => handleSelect("3-4")}
        >
          <Text
            style={[
              styles.optionText,
              selected === "3-4" && styles.optionTextSelected,
            ]}
          >
            3-4
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, selected === "5+" && styles.selectedOption]}
          onPress={() => handleSelect("5+")}
        >
          <Text
            style={[
              styles.optionText,
              selected === "5+" && styles.optionTextSelected,
            ]}
          >
            5+
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 48,
    lineHeight: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#333333",
  },
  optionText: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  optionTextSelected: {
    color: "#FCE9BC",
  },
});
