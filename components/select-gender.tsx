import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
interface SelectGenderProps {
  onSelect: (gender: "male" | "female" | "other") => void;
}

export const SelectGender = ({ onSelect }: SelectGenderProps) => {
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | "other" | null
  >(null);

  const handleSelect = async (gender: "male" | "female" | "other") => {
    await Haptics.selectionAsync();
    setSelectedGender(gender);
    onSelect(gender);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gender</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedGender === "male" && styles.selectedOption,
          ]}
          onPress={() => handleSelect("male")}
        >
          <Text
            style={[
              styles.optionText,
              selectedGender === "male" && styles.optionTextSelected,
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[
            styles.option,
            selectedGender === "female" && styles.selectedOption,
          ]}
          onPress={() => handleSelect("female")}
        >
          <Text
            style={[
              styles.optionText,
              selectedGender === "female" && styles.optionTextSelected,
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedGender === "other" && styles.selectedOption,
          ]}
          onPress={() => handleSelect("other")}
        >
          <Text
            style={[
              styles.optionText,
              selectedGender === "other" && styles.optionTextSelected,
            ]}
          >
            Other
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
    marginBottom: 32,
  },
  optionsContainer: {
    marginTop: 16,
  },
  option: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  selectedOption: {
    backgroundColor: "#333333",
    borderRadius: 16,
  },
  optionText: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    paddingHorizontal: 16,
  },
  optionTextSelected: {
    color: "#FCE9BC",
  },
});
