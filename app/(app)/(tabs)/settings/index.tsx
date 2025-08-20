import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import supabase from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { usePostHog } from "posthog-react-native";

export default function Settings() {
  const router = useRouter();
  const posthog = usePostHog();

  const handleRateApp = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      posthog.capture("settings_rate_app_tapped");
      
      const bundleId = "com.barnburnerhockey.proteinai";
      let storeUrl = "";
      
      if (Platform.OS === "ios") {
        // iOS App Store - direct link to write a review
        storeUrl = `https://apps.apple.com/app/id6740733967?action=write-review`;
      } else if (Platform.OS === "android") {
        // Google Play Store - direct link to app details with reviews
        storeUrl = `https://play.google.com/store/apps/details?id=${bundleId}`;
      }
      
      if (storeUrl) {
        const supported = await Linking.canOpenURL(storeUrl);
        if (supported) {
          await Linking.openURL(storeUrl);
        } else {
          console.error("Cannot open store URL:", storeUrl);
        }
      }
    } catch (error) {
      console.error("Error opening store:", error);
    }
  };

  const menuItems = [
    {
      title: "Modify Protein Goal",
      route: "/settings/protein-goal",
      icon: "chevron-right",
      onPress: null,
    },
    {
      title: "Account",
      route: "/settings/account", 
      icon: "chevron-right",
      onPress: null,
    },
    {
      title: "Subscription",
      route: "/settings/subscription",
      icon: "chevron-right",
      onPress: null,
    },
    {
      title: "Rate the App",
      route: null,
      icon: "star",
      onPress: handleRateApp,
    },
    {
      title: "Legal",
      route: "/settings/legal",
      icon: "chevron-right", 
      onPress: null,
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
            onPress={() => {
              if (item.onPress) {
                item.onPress();
              } else if (item.route) {
                router.push(item.route);
              }
            }}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <FontAwesome6 name={item.icon} size={24} color="#2A2A2A" />
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
