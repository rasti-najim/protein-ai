import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

export default function Settings() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Modify Protein Goal",
      route: "/settings/protein-goal",
      icon: "chevron-right",
    },
    {
      title: "Account",
      route: "/settings/account",
      icon: "chevron-right",
    },
    {
      title: "Subscription",
      route: "/settings/subscription",
      icon: "chevron-right",
    },
  ];

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await supabase.auth.signOut();
      // The AuthProvider will handle the redirect to /welcome
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />

      <Text style={styles.title}>Settings</Text>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <FontAwesome6 name="chevron-right" size={24} color="#2A2A2A" />
          </TouchableOpacity>
        ))}
      </View>

      {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity> */}
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
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  logoutButton: {
    marginTop: "auto",
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
});
