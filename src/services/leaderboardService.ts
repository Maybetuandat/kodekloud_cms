import { api } from "@/lib/api";
import { LeaderboardEntry } from "@/types/leaderboard";

export const leaderboardService = {
  getLeaderboardByCourse: async (
    courseId: number
  ): Promise<LeaderboardEntry[]> => {
    return api.get<LeaderboardEntry[]>(`/courses/${courseId}/leaderboard`);
  },
};
