import { Redirect, Slot } from "expo-router";
import { Stack } from "expo-router";

export default function AppLayout() {
  // return <Redirect href="/welcome" />;
  return <Slot />;
}
