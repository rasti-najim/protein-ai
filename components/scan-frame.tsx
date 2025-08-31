import { View, StyleSheet, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

export const ScanFrame = () => {
  const pulseValue = useSharedValue(0);
  const scanLineValue = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for corners
    pulseValue.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    // Scanning line animation
    scanLineValue.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cornerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseValue.value, [0, 1], [0.7, 1]);
    const scale = interpolate(pulseValue.value, [0, 1], [0.95, 1.05]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const scanLineAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scanLineValue.value, [0, 1], [-20, 300]);
    const opacity = interpolate(
      scanLineValue.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0]
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Corner frames with pulse animation */}
      <Animated.View
        style={[styles.corner, styles.topRight, cornerAnimatedStyle]}
      />
      <Animated.View
        style={[styles.corner, styles.topLeft, cornerAnimatedStyle]}
      />
      <Animated.View
        style={[styles.corner, styles.bottomRight, cornerAnimatedStyle]}
      />
      <Animated.View
        style={[styles.corner, styles.bottomLeft, cornerAnimatedStyle]}
      />

      {/* Scanning line */}
      <Animated.View style={[styles.scanLine, scanLineAnimatedStyle]} />

      {/* Guidance text */}
      <View style={styles.textContainer}>
        <Text style={styles.guidanceText}>Position your meal in the frame</Text>
        <Text style={styles.subText}>Make sure lighting is good</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderColor: "#fae5d2",
    borderWidth: 6,
    borderRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    width: "90%",
    height: 3,
    backgroundColor: "#fae5d2",
    shadowColor: "#fae5d2",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    position: "absolute",
    bottom: -80,
    alignItems: "center",
    width: "100%",
  },
  guidanceText: {
    fontSize: 18,
    color: "#fae5d2",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subText: {
    fontSize: 14,
    color: "rgba(250, 229, 210, 0.8)",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
