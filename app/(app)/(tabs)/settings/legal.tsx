import { View, Text, StyleSheet, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/button";

export default function Legal() {
  const handlePrivacyPolicy = () => {
    Linking.openURL("https://garrudnyai.github.io/ProteinAI/");
  };

  const handleTerms = () => {
    Linking.openURL(
      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Legal</Text>

        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={handlePrivacyPolicy}>
            <Text style={styles.buttonText}>Privacy Policy</Text>
          </Button>

          <Button style={styles.button} onPress={handleTerms}>
            <Text style={styles.buttonText}>Terms of Service</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fae5d2",
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 42,
    color: "#333333",
    fontWeight: "700",
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "#fae5d2",
    fontWeight: "600",
  },
});
