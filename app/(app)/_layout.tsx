import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/components/auth-context";
import Superwall from "@superwall/react-native-superwall";
import { useEffect } from "react";

export default function AppLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    Superwall.shared.getConfigurationStatus().then((status) => {
      console.log("Superwall configuration status:", status);
    });
  }, []);

  if (loading) {
    return null;
  }

  if (!session || !session.user) {
    return <Redirect href="/welcome" />;
  }
  return <Slot />;
}
