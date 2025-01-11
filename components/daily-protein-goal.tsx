import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { CircularProgress } from "./circular-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

interface DailyProteinGoalProps {
  targetWeight: number;
  targetWeightUnit: "lbs" | "kg";
  exerciseFrequency: "0-2" | "3-4" | "5+";
  goal: "lose" | "gain" | "maintain";
  onSelect: (proteinGoal: number) => void;
}

export const DailyProteinGoal = ({
  targetWeight,
  targetWeightUnit,
  exerciseFrequency,
  goal,
  onSelect,
}: DailyProteinGoalProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const numberAnim = useRef(new Animated.Value(0)).current;

  const calculateProteinGoal = () => {
    let weightInPounds = targetWeight;
    if (targetWeightUnit === "kg") {
      weightInPounds = targetWeight * 2.20462;
    }
    return Math.round(weightInPounds);
  };

  const proteinGoal = calculateProteinGoal();

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.timing(numberAnim, {
        toValue: proteinGoal,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onSelect(proteinGoal);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        Your Daily{"\n"}Protein Goal
      </Animated.Text>

      <Animated.View
        style={[
          styles.goalContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <CircularProgress
          progress={1}
          size={200}
          strokeWidth={8}
          color="#4CAF50"
          backgroundColor="#E0E0E0"
        >
          <View style={styles.goalContent}>
            <Animated.Text style={styles.goalNumber}>
              {numberAnim.interpolate({
                inputRange: [0, proteinGoal],
                outputRange: ["0g", `${proteinGoal}g`],
              })}
            </Animated.Text>
            <Text style={styles.goalLabel}>protein</Text>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color="#4CAF50"
              />
            </Animated.View>
          </View>
        </CircularProgress>
      </Animated.View>

      <Animated.Text
        style={[
          styles.description,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        We calculated <Text style={styles.boldText}>{proteinGoal}g</Text> as
        your <Text style={styles.boldText}>ideal daily protein goal</Text>. You
        can always change it later in Settings.
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 40,
  },
  goalContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  goalContent: {
    alignItems: "center",
  },
  goalNumber: {
    fontSize: 48,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  goalLabel: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginTop: 4,
  },
  iconContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    lineHeight: 32,
    marginBottom: 40,
  },
  boldText: {
    fontWeight: "bold",
  },
  finishButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  finishButtonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
});
