import { Text, View, StyleSheet } from "react-native";
import { OnboardingLayout } from "./onboarding-layout";

interface PerfectProps {
  onNext: () => void;
}

export const Perfect = ({ onNext }: PerfectProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfect!</Text>

      <Text style={styles.description}>
        We calculate a{" "}
        <Text style={{ fontWeight: "bold" }}>daily protein goal</Text> from your
        profile that will allow you to{" "}
        <Text style={{ fontWeight: "bold" }}>achieve your goals</Text> & gain
        more
        <Text style={{ fontWeight: "bold" }}>long-lasting energy</Text>.
      </Text>

      <Text style={styles.subtitle}>
        <Text style={{ fontWeight: "bold" }}>Continue</Text> to the final step!
      </Text>
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
