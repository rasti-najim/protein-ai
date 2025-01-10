import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { CircularProgress } from "./circular-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DailyProteinGoalProps {
  proteinGoal: number;
  onFinish: () => void;
}

export const DailyProteinGoal = ({
  proteinGoal,
  onFinish,
}: DailyProteinGoalProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Daily{"\n"}Protein Goal</Text>

      <View style={styles.goalContainer}>
        <CircularProgress
          progress={1}
          size={200}
          strokeWidth={8}
          color="#4CAF50"
          backgroundColor="#E0E0E0"
        >
          <View style={styles.goalContent}>
            <Text style={styles.goalNumber}>{proteinGoal}g</Text>
            <Text style={styles.goalLabel}>protein</Text>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color="#4CAF50"
              />
            </View>
          </View>
        </CircularProgress>
      </View>

      <Text style={styles.description}>
        We calculated <Text style={styles.boldText}>{proteinGoal}g</Text> as
        your <Text style={styles.boldText}>ideal daily protein goal</Text>. You
        can always change it later in Settings.
      </Text>
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
