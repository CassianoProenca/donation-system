import api from "@/shared/api/client";
import type { DashboardMetrics } from "../types";

export const dashboardApi = {
  async getMetrics(dataInicio?: string, dataFim?: string): Promise<DashboardMetrics> {
    const response = await api.get("/api/dashboard/metrics", {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },
};

