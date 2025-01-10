import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/components/auth-context";
import { useEffect } from "react";
import Superwall from "@superwall/react-native-superwall";

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY) {
      Superwall.configure(process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY);
    }
  }, []);

  return (
    <AuthProvider>
      <GestureHandlerRootView>
        <Slot />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
