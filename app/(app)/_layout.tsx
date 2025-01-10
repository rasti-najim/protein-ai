import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/components/auth-context";

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session || !session.user) {
    return <Redirect href="/welcome" />;
  }
  return <Slot />;
}
