import { Text, View, StyleSheet, Animated } from "react-native";
import { OnboardingLayout } from "./onboarding-layout";
import { useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  }, []);

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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    lineHeight: 28,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    lineHeight: 28,
  },
});
