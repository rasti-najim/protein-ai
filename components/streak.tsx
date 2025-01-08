import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

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
    <View style={styles.content}>
      <Text style={styles.title}>Starter</Text>

      <View style={styles.iconContainer}>
        <FontAwesome5 name="seedling" size={100} color="#4CAF50" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#333333",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  streakText: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 32,
  },
  nextLevelText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 28,
  },
  closeButton: {
    backgroundColor: "#FCE9BC",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  closeButtonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#333333",
    textAlign: "center",
    fontWeight: "600",
  },
});
