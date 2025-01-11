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
  }, []);

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
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 24,
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
