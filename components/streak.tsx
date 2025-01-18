import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface StreakProps {
  currentStreak: number;
  daysToNextLevel: number;
  onClose: () => void;
}

export const Streak = ({
  currentStreak,
  daysToNextLevel,
  onClose,
}: StreakProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Starter</Text>

        <View style={styles.iconContainer}>
          <FontAwesome5 name="seedling" size={64} color="#4CAF50" />
        </View>

        <Text style={styles.streakText}>
          You have hit your protein goal for {currentStreak} consecutive day
        </Text>

        <Text style={styles.nextLevelText}>
          Stay consistent for {daysToNextLevel} more days to level up!
        </Text>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333333",
    padding: 20,
    justifyContent: "center",
  },
  content: {
    backgroundColor: "#333333",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 48,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  streakText: {
    fontSize: 28,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
  },
  nextLevelText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
    opacity: 0.8,
  },
  closeButton: {
    backgroundColor: "#FCE9BC",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#333333",
    textAlign: "center",
    fontWeight: "600",
  },
});
