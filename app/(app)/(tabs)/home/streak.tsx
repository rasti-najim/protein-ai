import { Streak } from "@/components/streak";
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();

  return (
    <Streak
      currentStreak={10}
      daysToNextLevel={10}
      onClose={() => {
        router.back();
      }}
    />
  );
}
