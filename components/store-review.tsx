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
import * as StoreReview from "expo-store-review";

interface StoreReviewProps {
  onClose: (action: 'rate' | 'later') => void;
}

export const StoreReviewPrompt = ({ onClose }: StoreReviewProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

  const handleReview = async () => {
    try {
      if (await StoreReview.hasAction()) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log("Error requesting review:", error);
    }
    onClose('rate');
  };

  const handleMaybeLater = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose('later');
  };

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
          <FontAwesome6 name="star" size={48} color="#FFD700" />
        </View>

        <Text style={styles.title}>Enjoying Protein AI?</Text>
        <Text style={styles.subtitle}>
          Would you mind giving us a rating? It really helps other users discover the app.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleReview}>
            <Text style={styles.primaryButtonText}>Rate Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleMaybeLater}>
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  title: {
    fontSize: 28,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#7FEA71",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    fontWeight: "500",
  },
});