import { View, StyleSheet, Animated, Text } from "react-native";
import { useEffect, useRef } from "react";

interface MealSkeletonProps {
  showCalculating?: boolean;
}

export const MealSkeleton = ({
  showCalculating = false,
}: MealSkeletonProps) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.mealItem}>
      <View>
        <Animated.View style={[styles.skeletonName, { opacity: fadeAnim }]} />
        {showCalculating && (
          <Animated.Text
            style={[styles.calculatingText, { opacity: fadeAnim }]}
          >
            Calculating protein...
          </Animated.Text>
        )}
      </View>
      <Animated.View style={[styles.skeletonProtein, { opacity: fadeAnim }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 42, 42, 0.1)",
  },
  skeletonName: {
    width: 120,
    height: 24,
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonProtein: {
    width: 60,
    height: 24,
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    borderRadius: 4,
  },
  calculatingText: {
    fontSize: 14,
    fontFamily: "Platypi",
    color: "#666666",
    fontStyle: "italic",
  },
});
