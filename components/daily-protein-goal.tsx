import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { CircularProgress } from "./circular-progress";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";

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

  const calculateProteinGoal = () => {
    let weightInPounds = targetWeight;
    if (targetWeightUnit === "kg") {
      weightInPounds = targetWeight * 2.20462;
    }
    return Math.round(weightInPounds);
  };

  const proteinGoal = calculateProteinGoal();

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
    ]).start(() => {
      onSelect(proteinGoal);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Daily{"\n"}Protein Goal</Text>

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
            startAngle={105}
            gapDegrees={0}
            color="#4CAF50"
            backgroundColor="#E0E0E0"
          >
            <View style={styles.goalContent}>
              <Text style={styles.goalNumber}>{proteinGoal}g</Text>
              <Text style={styles.goalLabel}>protein</Text>
            </View>
          </CircularProgress>
        </Animated.View>

        <Text style={styles.description}>
          We calculated <Text style={styles.boldText}>{proteinGoal}g</Text> as
          your <Text style={styles.boldText}>ideal daily protein goal</Text>.
          You can always change it later in Settings.
        </Text>
      </ScrollView>

      <View style={styles.citationContainer}>
        <Text style={styles.citationTitle}>
          Daily Protein Intake plan based on the following sources, among other
          peer-reviewed studies:
        </Text>
        <View style={styles.bulletPoints}>
          <Text style={styles.citationText}>
            <Text
              style={styles.citationLink}
              onPress={() =>
                Linking.openURL(
                  "https://www.healthline.com/nutrition/how-much-protein-per-day"
                )
              }
            >
              • Dietary Protein Intake
            </Text>
          </Text>
          <Text style={styles.citationText}>
            <Text
              style={styles.citationLink}
              onPress={() =>
                Linking.openURL(
                  "https://blog.nasm.org/nutrition/how-much-protein-should-you-eat-per-day-for-weight-loss?utm_source=blog&utm_medium=referral&utm_campaign=organic&utm_content=safeandhealthyweightloss#:~:text=a%20great%20option!-,Summary,if%20aiming%20for%20weight%20loss."
                )
              }
            >
              • Protein & Weight Loss
            </Text>
          </Text>
          <Text style={styles.citationText}>
            <Text
              style={styles.citationLink}
              onPress={() =>
                Linking.openURL(
                  "https://pmc.ncbi.nlm.nih.gov/articles/PMC5852756/"
                )
              }
            >
              • Protein & Muscle Hypertrophy
            </Text>
          </Text>
          <Text style={styles.citationText}>
            <Text
              style={styles.citationLink}
              onPress={() =>
                Linking.openURL("https://pubmed.ncbi.nlm.nih.gov/24092765/")
              }
            >
              • Dietary Protein for Lean Athletes
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
    fontSize: 18,
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
  citationContainer: {
    backgroundColor: "#FCE9BC",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(42, 42, 42, 0.1)",
  },
  citationTitle: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    marginBottom: 8,
  },
  bulletPoints: {
    paddingLeft: 8,
  },
  citationText: {
    fontSize: 14,
    fontFamily: "Platypi",
    color: "#666666",
    lineHeight: 24,
  },
  citationLink: {
    color: "#666666",
    textDecorationLine: "underline",
  },
});
