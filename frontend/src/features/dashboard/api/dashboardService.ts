import api from "@/shared/api/client";
import type { DashboardMetrics } from "../types";

export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await api.get("/api/dashboard/metrics");
    return response.data;
  },
};

