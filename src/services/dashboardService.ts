import { api } from "@/lib/api";
import { DashboardEntry } from "@/types/leaderboard";

export const leaderboardService = {
  getLeaderboardByCourse: async (
    courseId: number
  ): Promise<DashboardEntry[]> => {
    return api.get<DashboardEntry[]>(`/courses/${courseId}/dashboard`);
  },
};
