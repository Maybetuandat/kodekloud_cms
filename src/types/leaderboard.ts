export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  fullName: string;
  totalScore: number;
  completedLabs: number;
  totalLabs: number;
  completionRate: number;
  averageTime: number;
  totalTime: number;
  firstTimeCompletions: number;
  fastCompletions: number;
  lastActivityAt: string;
}
