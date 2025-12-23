export interface DashboardEntry {
  rank: number;
  userId: number;
  username: string;
  fullName: string;
  totalScore: number;
  completedLabs: number;
  totalAttempts: number;
  totalSubmissions: number;
  completionRate: number;
  lastActivityAt: string | null;
}
