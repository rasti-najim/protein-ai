import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/components/auth-context";
import { PhotoProvider } from "@/components/photo-context";
import { useEffect } from "react";
import Superwall from "@superwall/react-native-superwall";
import { PostHogProvider } from "posthog-react-native";

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY) {
      Superwall.configure(process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY);
    }
  }, []);

  return (
    <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}>
      <AuthProvider>
        <PhotoProvider>
          <GestureHandlerRootView>
            <Slot />
          </GestureHandlerRootView>
        </PhotoProvider>
      </AuthProvider>
    </PostHogProvider>
  );
}
