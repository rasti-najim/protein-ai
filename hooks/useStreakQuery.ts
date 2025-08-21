import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";

interface StreakHistoryItem {
  date: string;               // YYYY-MM-DD format
  total_protein: number;      // protein consumed that day
  goal_met: boolean;          // whether daily goal was achieved
  created_at: string;         // when record was created
  updated_at: string;         // when record was last updated
}

interface StreakData {
  length: number;               // current streak
  maxStreak: number;            // highest streak achieved
  lastGoalDate: string | null;  // last date goal was met (YYYY-MM-DD)
  streakHistory: StreakHistoryItem[];  // last 30 days from daily_protein_totals
}

interface DailyBreakdown {
  date: string;
  hitGoal: boolean;
}

const fetchStreakData = async (userId: string): Promise<StreakData> => {
  const { data, error } = await supabase.functions.invoke('fetch-streak', {
    body: { userId }
  });

  if (error) {
    throw new Error(`Failed to fetch streak data: ${error.message}`);
  }

  return data;
};

const convertToDailyBreakdown = (streakHistory: StreakHistoryItem[]): DailyBreakdown[] => {
  const today = DateTime.now();
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = today.minus({ days: 6 - i });
    const dateStr = date.toISODate() as string;
    
    // Find the streak history item for this date
    const dayData = streakHistory.find((item) => item.date === dateStr);
    const hitGoal = dayData?.goal_met || false;
    
    return { date: dateStr, hitGoal };
  });
};

export const useStreakQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streak', user?.id],
    queryFn: () => fetchStreakData(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: StreakData) => ({
      ...data,
      dailyBreakdown: convertToDailyBreakdown(data.streakHistory || []),
    }),
  });
};