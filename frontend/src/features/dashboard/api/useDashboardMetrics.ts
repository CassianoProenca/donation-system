import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardService";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

