import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

interface GoalReachedProps {
  onClose: () => void;
}

export const GoalReached = ({ onClose }: GoalReachedProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="star" size={64} color="#FFD700" />
        </View>

        <Text style={styles.title}>Daily Goal Reached! 🎉</Text>
        <Text style={styles.subtitle}>
          Great job hitting your protein goal for today!
        </Text>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#FCE9BC",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#333333",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    fontWeight: "600",
  },
});
