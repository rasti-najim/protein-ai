import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

interface GoalReachedProps {
  onClose: () => void;
}

export const GoalReached = ({ onClose }: GoalReachedProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Initial entrance animation
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

    // Continuous icon animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: bounceAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <FontAwesome6 name="fire" size={64} color="#FF6B35" />
        </Animated.View>

        <Text style={styles.title}>Goal Crushed!</Text>
        <Text style={styles.subtitle}>
          Amazing work! You've hit your protein target and extended your streak!
        </Text>

        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>I'm committed!</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#FCE9BC",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  title: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#7FEA71",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: "100%",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    fontWeight: "600",
  },
});
