import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fae5d2",
          borderTopWidth: 1,
          borderTopColor: "rgba(51, 51, 51, 0.1)",
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#333333",
        tabBarInactiveTintColor: "rgba(51, 51, 51, 0.5)",
        tabBarLabelStyle: {
          fontSize: 0, // Hide labels since title is empty
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="house" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={28} name="gear" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
