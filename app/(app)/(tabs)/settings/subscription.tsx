import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

export default function Subscription() {
  const router = useRouter();

  const handleManageSubscription = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement subscription management logic
    console.log("Managing subscription");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />

      <Text style={styles.title}>Subscription</Text>

      <View style={styles.content}>
        <View style={styles.subscriptionInfo}>
          <FontAwesome6 name="crown" size={32} color="#FFD700" />
          <Text style={styles.planName}>Premium Plan</Text>
          <Text style={styles.planDescription}>
            Access to all premium features and unlimited protein tracking
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageSubscription}
        >
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
    padding: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 40,
  },
  content: {
    flex: 1,
  },
  subscriptionInfo: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(42, 42, 42, 0.05)",
    borderRadius: 16,
    marginBottom: 24,
  },
  planName: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginTop: 16,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#666666",
    textAlign: "center",
    lineHeight: 28,
  },
  manageButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  manageButtonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
});
