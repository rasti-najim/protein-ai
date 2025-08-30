import { Text, View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const Perfect = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Perfect!</Text>

        <Text style={styles.description}>
          We calculate a{" "}
          <Text style={{ fontWeight: "bold" }}>daily protein goal</Text> from
          your profile that will allow you to{" "}
          <Text style={{ fontWeight: "bold" }}>achieve your goals</Text> & gain
          more <Text style={{ fontWeight: "bold" }}>long-lasting energy</Text>.
        </Text>

        <Text style={styles.subtitle}>
          <Text style={{ fontWeight: "bold" }}>Continue</Text> to see your goal!
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    color: "#333333",
    marginBottom: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "rgba(51, 51, 51, 0.8)",
    lineHeight: 26,
    marginBottom: 32,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.7)",
    lineHeight: 22,
    textAlign: "center",
  },
});
