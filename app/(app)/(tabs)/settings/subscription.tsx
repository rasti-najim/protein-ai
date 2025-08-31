import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Button } from "@/components/button";
export default function Subscription() {
  const router = useRouter();

  const handleManageSubscription = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open App Store subscriptions page
    Linking.openURL("itms-apps://apps.apple.com/account/subscriptions");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Subscription</Text>

        <View style={styles.content}>
          {/* <View style={styles.subscriptionInfo}>
          <FontAwesome6 name="crown" size={32} color="#FFD700" />
          <Text style={styles.planName}>Premium Plan</Text>
          <Text style={styles.planDescription}>
            Access to all premium features and unlimited protein tracking
          </Text>
        </View> */}

          <Button
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
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
  content: {
    flex: 1,
  },
  subscriptionInfo: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(51, 51, 51, 0.05)",
    borderRadius: 16,
    marginBottom: 24,
  },
  planName: {
    fontSize: 32,
    color: "#333333",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 20,
    color: "rgba(51, 51, 51, 0.7)",
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
    color: "#fae5d2",
    fontSize: 20,
    fontWeight: "600",
  },
});
