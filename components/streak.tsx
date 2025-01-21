import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Button } from "@/components/button";

interface StreakProps {
  name: string;
  emoji: string;
  currentStreak: number;
  daysToNextLevel: number;
  onClose: () => void;
}

export const Streak = ({
  name,
  emoji,
  currentStreak,
  daysToNextLevel,
  onClose,
}: StreakProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentStreak === 0 ? (
          <>
            <Text style={styles.title}>Start Your Streak!</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>💪</Text>
            </View>
            <Text style={styles.streakText}>
              Hit your daily protein goal to start building your streak
            </Text>
            <Text style={styles.nextLevelText}>
              Stay consistent to unlock new achievements
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{name}</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <Text style={styles.streakText}>
              You have hit your {name} goal for {currentStreak} consecutive days
            </Text>
            <Text style={styles.nextLevelText}>
              Stay consistent for {daysToNextLevel} more days to level up!
            </Text>
          </>
        )}

        <Button style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Button>
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
  emoji: {
    fontSize: 64,
    color: "#4CAF50",
  },
});
