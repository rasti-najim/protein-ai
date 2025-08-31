import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/components/auth-context";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Button } from "@/components/button";
import { usePostHog } from "posthog-react-native";

export default function Account() {
  const { signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();
  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Alert.alert("Log Out", "Are you sure you want to log out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await signOut();
              posthog.capture("user_logged_out");
              posthog.reset();
            } catch (error) {
              console.error("Error signing out:", error);
            }
            // The AuthProvider will handle the redirect to /welcome
          },
        },
      ]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteAccount();
              posthog.capture("user_deleted_account");
              posthog.reset();
              // The AuthProvider will handle the redirect to /welcome after deletion
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Account</Text>

        <View style={styles.buttonContainer}>
          <Button style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Button>

          <Button style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
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
  logoutButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 20,
    color: "#fae5d2",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
