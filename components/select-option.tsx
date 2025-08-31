import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

interface Option {
  value: string;
  label: string;
}

interface SelectOptionProps {
  title: string;
  subtitle?: string;
  options: Option[];
  onSelect: (value: string) => void;
}

export const SelectOption = ({
  title,
  subtitle,
  options,
  onSelect,
}: SelectOptionProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSelect = async (value: string) => {
    await Haptics.selectionAsync();
    setSelected(value);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selected === option.value && styles.selectedOption,
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    color: "#333333",
    marginBottom: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(51, 51, 51, 0.7)",
    marginBottom: 48,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 2,
    borderColor: "rgba(51, 51, 51, 0.1)",
  },
  selectedOption: {
    backgroundColor: "#333333",
    borderColor: "#333333",
  },
  optionText: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "600",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fae5d2",
  },
});
