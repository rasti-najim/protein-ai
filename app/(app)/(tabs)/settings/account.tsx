import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/components/auth-context";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Button } from "@/components/button";

export default function Account() {
  const { signOut, deleteAccount } = useAuth();
  const router = useRouter();

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
            await signOut();
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
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />

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
    fontFamily: "Platypi",
    color: "#FCE9BC",
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
    fontFamily: "Platypi",
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
