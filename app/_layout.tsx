import { Slot, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/components/auth-context";
import { PhotoProvider } from "@/components/photo-context";
import { useEffect } from "react";
import Superwall from "@superwall/react-native-superwall";
import { PostHogProvider } from "posthog-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
      retry: 2,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY) {
      Superwall.configure(process.env.EXPO_PUBLIC_SUPARWALL_PUBLIC_KEY);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}>
        <AuthProvider>
          <PhotoProvider>
            <GestureHandlerRootView>
              <Slot />
            </GestureHandlerRootView>
          </PhotoProvider>
        </AuthProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
