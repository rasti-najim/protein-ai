import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="camera"
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen name="manual" options={{ presentation: "modal" }} />
      <Stack.Screen name="streak" options={{ presentation: "modal" }} />
    </Stack>
  );
}
