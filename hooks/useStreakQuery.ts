import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";
import { DateTime } from "luxon";

interface StreakHistoryItem {
  periodStart: string;
  periodEnd: string;
  length: number;
}

interface StreakData {
  length: number;
  streakHistory: StreakHistoryItem[];
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
    
    // Find if this date falls within any streak period
    const hitGoal = streakHistory.some((period) => {
      const periodStart = DateTime.fromISO(period.periodStart);
      const periodEnd = DateTime.fromISO(period.periodEnd);
      return date >= periodStart && date <= periodEnd && period.length > 0;
    });
    
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
      dailyBreakdown: convertToDailyBreakdown(data.streakHistory),
    }),
  });
};