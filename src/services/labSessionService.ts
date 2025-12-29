import { api } from "@/lib/api";

export const labSessionService = {
  getLabHistory: async (params: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) => {
    const queryParams: Record<string, string> = {
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    };

    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    return api.get<any>("/api/lab-sessions/history", queryParams);
  },
};
