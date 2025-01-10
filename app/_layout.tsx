import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/components/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <Slot />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
