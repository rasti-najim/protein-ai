import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            // onPress={() => router.push(item.route)}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <FontAwesome6 name="chevron-right" size={24} color="#2A2A2A" />
          </TouchableOpacity>
        ))}
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
});
