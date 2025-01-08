import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useRef } from "react";
import * as Haptics from "expo-haptics";

interface WeightProps {
  onSelect: (weight: number, unit: "imperial" | "metric") => void;
}

export const Weight = ({ onSelect }: WeightProps) => {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [weight, setWeight] = useState(185);
  const scrollViewRef = useRef<ScrollView>(null);

  const generateWeights = () => {
    const weights = [];
    const min = unit === "imperial" ? 50 : 23;
    const max = unit === "imperial" ? 400 : 181;

    for (let i = min; i <= max; i++) {
      weights.push(i);
    }
    return weights;
  };

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "metric") {
      const newWeight = Math.round(weight * 0.453592);
      setWeight(newWeight);
      onSelect(newWeight, newUnit);
    } else {
      const newWeight = Math.round(weight * 2.20462);
      setWeight(newWeight);
      onSelect(newWeight, newUnit);
    }
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const newWeight = Math.round(
      (unit === "imperial" ? 50 : 23) + Math.floor(y / 60)
    );
    if (newWeight !== weight) {
      setWeight(newWeight);
      onSelect(newWeight, unit);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight</Text>

      <View style={styles.unitSelector}>
        <TouchableOpacity
          onPress={() => handleUnitChange("imperial")}
          style={styles.unitButton}
        >
          <Text
            style={[
              styles.unitText,
              unit === "imperial" ? styles.activeUnit : styles.inactiveUnit,
            ]}
          >
            Imperial
          </Text>
        </TouchableOpacity>
        <Text style={styles.unitDivider}>|</Text>
        <TouchableOpacity
          onPress={() => handleUnitChange("metric")}
          style={styles.unitButton}
        >
          <Text
            style={[
              styles.unitText,
              unit === "metric" ? styles.activeUnit : styles.inactiveUnit,
            ]}
          >
            Metric
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerHighlight} />
        <View style={styles.pickerContent}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={60}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.pickerPadding} />
            {generateWeights().map((num) => (
              <View key={num} style={styles.pickerItem}>
                <Text style={styles.pickerText}>{num}</Text>
              </View>
            ))}
            <View style={styles.pickerPadding} />
          </ScrollView>
          <View style={styles.unitLabelContainer}>
            <Text style={styles.unitLabel}>
              {unit === "imperial" ? "lbs" : "kg"}
            </Text>
          </View>
        </View>
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
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 48,
  },
  unitButton: {
    paddingHorizontal: 16,
  },
  unitText: {
    fontSize: 32,
    fontFamily: "Platypi",
  },
  activeUnit: {
    color: "#2A2A2A",
  },
  inactiveUnit: {
    color: "#9E9E9E",
  },
  unitDivider: {
    fontSize: 32,
    color: "#9E9E9E",
    fontFamily: "Platypi",
  },
  pickerContainer: {
    height: 180,
    position: "relative",
    width: "100%",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 80,
  },
  picker: {
    flex: 1,
  },
  pickerHighlight: {
    position: "absolute",
    top: "50%",
    marginTop: -30,
    height: 60,
    width: "100%",
    backgroundColor: "rgba(42, 42, 42, 0.05)",
    borderRadius: 16,
  },
  pickerItem: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerText: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  unitLabelContainer: {
    position: "absolute",
    right: "25%",
    top: "50%",
    marginTop: -16,
  },
  unitLabel: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginLeft: 16,
  },
  pickerPadding: {
    height: 120,
  },
});
