import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardService";

export function useDashboardMetrics(dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ["dashboard-metrics", dataInicio, dataFim],
    queryFn: () => dashboardApi.getMetrics(dataInicio, dataFim),
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

