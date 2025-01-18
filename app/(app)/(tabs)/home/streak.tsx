import { Streak } from "@/components/streak";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function Page() {
  const router = useRouter();
  const { streak } = useLocalSearchParams();
  const streakData = JSON.parse(streak as string);
  console.log("streakData", streakData);

  return (
    <Streak
      currentStreak={streakData.current_streak}
      daysToNextLevel={streakData.days_to_next_level}
      onClose={() => {
        router.back();
      }}
    />
  );
}
