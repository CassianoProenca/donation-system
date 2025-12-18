import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboardMetrics } from "./useDashboardMetrics";
import { dashboardApi } from "./dashboardService";
import type { ReactNode } from "react";

// Mock do dashboardApi
vi.mock("./dashboardService", () => ({
  dashboardApi: {
    getMetrics: vi.fn(),
  },
}));

describe("useDashboardMetrics", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("deve buscar métricas do dashboard com sucesso", async () => {
    const mockMetrics = {
      totalCategorias: 5,
      totalProdutos: 20,
      totalLotes: 15,
      estoqueTotal: 1000,
      movimentacoesHoje: 3,
      alertasCriticos: {
        lotesVencendo: 2,
        produtosEstoqueBaixo: 1,
        lotesSemEstoque: 0,
      },
      evolucaoEstoque: [],
      top5ProdutosMaisDistribuidos: [],
      ultimasMovimentacoes: [],
      movimentacoesPorDia: [],
      movimentacoesPorTipo: [],
    };

    vi.mocked(dashboardApi.getMetrics).mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useDashboardMetrics("2025-12-01", "2025-12-18"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMetrics);
    expect(dashboardApi.getMetrics).toHaveBeenCalledWith("2025-12-01", "2025-12-18");
  });

  it("deve lidar com erro ao buscar métricas", async () => {
    const error = new Error("Erro ao buscar métricas");
    vi.mocked(dashboardApi.getMetrics).mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("deve usar cache corretamente", async () => {
    const mockMetrics = {
      totalCategorias: 5,
      totalProdutos: 20,
      totalLotes: 15,
      estoqueTotal: 1000,
      movimentacoesHoje: 3,
      alertasCriticos: {
        lotesVencendo: 0,
        produtosEstoqueBaixo: 0,
        lotesSemEstoque: 0,
      },
      evolucaoEstoque: [],
      top5ProdutosMaisDistribuidos: [],
      ultimasMovimentacoes: [],
      movimentacoesPorDia: [],
      movimentacoesPorTipo: [],
    };

    vi.mocked(dashboardApi.getMetrics).mockResolvedValue(mockMetrics);

    const { result, rerender } = renderHook(
      ({ dataInicio, dataFim }) => useDashboardMetrics(dataInicio, dataFim),
      {
        wrapper,
        initialProps: { dataInicio: "2025-12-01", dataFim: "2025-12-18" },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Rerender com os mesmos parâmetros não deve fazer nova requisição devido ao cache
    rerender({ dataInicio: "2025-12-01", dataFim: "2025-12-18" });

    // Ainda deve ter sido chamado apenas uma vez devido ao staleTime e mesma queryKey
    expect(dashboardApi.getMetrics).toHaveBeenCalledTimes(1);

    // Rerender com parâmetros diferentes deve fazer nova requisição
    rerender({ dataInicio: "2025-11-01", dataFim: "2025-11-30" });
    
    await waitFor(() => {
      expect(dashboardApi.getMetrics).toHaveBeenCalledTimes(2);
    });
  });
});

