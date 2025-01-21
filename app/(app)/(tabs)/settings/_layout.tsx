import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="protein-goal" />
      <Stack.Screen name="account" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
