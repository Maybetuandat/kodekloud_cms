import { api } from "@/lib/api";
import {
  GetLabHistoryParams,
  LabHistoryResponse,
  LabSessionStatistic,
} from "@/types/labSesion";

const ENDPOINT = "/lab-sessions";

export const labSessionService = {
  getLabHistory: async (
    params: GetLabHistoryParams
  ): Promise<LabHistoryResponse> => {
    const queryParams: Record<string, string> = {
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    };

    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }
    if (params.userId) {
      queryParams.userId = params.userId.toString();
    }
    const response = api.get<LabHistoryResponse>(
      `${ENDPOINT}/admin/history`,
      queryParams
    );

    console.log("Lab history response:", response);
    return response;
  },

  getLabSessionStatistic: async (
    sessionId: number
  ): Promise<LabSessionStatistic> => {
    return api.get<LabSessionStatistic>(`${ENDPOINT}/${sessionId}/statistic`);
  },
};
