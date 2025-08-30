import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";

interface WeightProps {
  onSelect: (weight: number, unit: "lbs" | "kg") => void;
}

export const Weight = ({ onSelect }: WeightProps) => {
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight] = useState(185);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const generateWeights = () => {
    const weights = [];
    const min = unit === "lbs" ? 50 : 23;
    const max = unit === "lbs" ? 400 : 181;

    for (let i = min; i <= max; i++) {
      weights.push(i);
    }
    return weights;
  };

  const handleUnitChange = (newUnit: "lbs" | "kg") => {
    setUnit(newUnit);
    if (newUnit === "kg") {
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
      (unit === "lbs" ? 50 : 23) + Math.floor(y / 60)
    );
    if (newWeight !== weight) {
      setWeight(newWeight);
      onSelect(newWeight, unit);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
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
        <Text style={styles.title}>Target Weight</Text>
        <Text style={styles.subtitle}>
          Set a realistic goal for your fitness journey
        </Text>

        <View style={styles.unitSelector}>
          <TouchableOpacity
            onPress={() => handleUnitChange("lbs")}
            style={[
              styles.unitButton,
              unit === "lbs" && styles.activeUnitBackground,
            ]}
          >
            <Text
              style={[
                styles.unitText,
                unit === "lbs" ? styles.activeUnit : styles.inactiveUnit,
              ]}
            >
              Imperial
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleUnitChange("kg")}
            style={[
              styles.unitButton,
              unit === "kg" && styles.activeUnitBackground,
            ]}
          >
            <Text
              style={[
                styles.unitText,
                unit === "kg" ? styles.activeUnit : styles.inactiveUnit,
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
                {unit === "lbs" ? "lbs" : "kg"}
              </Text>
            </View>
          </View>
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
  title: {
    fontSize: 36,
    color: "#333333",
    marginBottom: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(51, 51, 51, 0.7)",
    marginBottom: 40,
    lineHeight: 24,
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    padding: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  activeUnit: {
    color: "#fae5d2",
  },
  inactiveUnit: {
    color: "rgba(51, 51, 51, 0.6)",
  },
  activeUnitBackground: {
    backgroundColor: "#333333",
  },
  pickerContainer: {
    height: 200,
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    overflow: "hidden",
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
    backgroundColor: "rgba(51, 51, 51, 0.1)",
    borderRadius: 12,
    marginHorizontal: 16,
    left: 0,
    right: 0,
  },
  pickerItem: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerText: {
    fontSize: 28,
    color: "#333333",
    fontWeight: "600",
  },
  unitLabelContainer: {
    position: "absolute",
    right: "25%",
    top: "50%",
    marginTop: -16,
  },
  unitLabel: {
    fontSize: 28,
    color: "#333333",
    marginLeft: 16,
    fontWeight: "600",
  },
  pickerPadding: {
    height: 140,
  },
  content: {
    flex: 1,
  },
});
