import { apiClient } from "@/shared/api/client";
import type { Page, PaginationParams } from "@/shared/types";
import type {
  MovimentacaoRequest,
  MovimentacaoResponse,
  MovimentacaoFilters,
  MontagemKitRequest,
} from "../types";

export const movimentacaoService = {
  getAll: async (
    filters: MovimentacaoFilters,
    pagination: PaginationParams
  ): Promise<Page<MovimentacaoResponse>> => {
    const params = new URLSearchParams();

    if (filters.loteId) params.append("loteId", filters.loteId.toString());
    if (filters.usuarioId)
      params.append("usuarioId", filters.usuarioId.toString());
    if (filters.tipo) params.append("tipo", filters.tipo);
    if (filters.dataInicio) params.append("dataInicio", `${filters.dataInicio}T00:00:00`);
    if (filters.dataFim) params.append("dataFim", `${filters.dataFim}T23:59:59`);
    if (filters.busca) params.append("busca", filters.busca);

    params.append("page", (pagination.page ?? 0).toString());
    params.append("size", (pagination.size ?? 10).toString());

    const response = await apiClient.get<Page<MovimentacaoResponse>>(
      `/api/movimentacoes?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<MovimentacaoResponse> => {
    const response = await apiClient.get<MovimentacaoResponse>(
      `/api/movimentacoes/${id}`
    );
    return response.data;
  },

  create: async (data: MovimentacaoRequest): Promise<MovimentacaoResponse> => {
    const response = await apiClient.post<MovimentacaoResponse>(
      "/api/movimentacoes",
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/movimentacoes/${id}`);
  },

  getPorLote: async (loteId: number): Promise<MovimentacaoResponse[]> => {
    const response = await apiClient.get<MovimentacaoResponse[]>(
      `/api/movimentacoes/lote/${loteId}`
    );
    return response.data;
  },

  getPorUsuario: async (usuarioId: number): Promise<MovimentacaoResponse[]> => {
    const response = await apiClient.get<MovimentacaoResponse[]>(
      `/api/movimentacoes/usuario/${usuarioId}`
    );
    return response.data;
  },

  getPorTipo: async (tipo: string): Promise<MovimentacaoResponse[]> => {
    const response = await apiClient.get<MovimentacaoResponse[]>(
      `/api/movimentacoes/tipo/${tipo}`
    );
    return response.data;
  },

  getPorPeriodo: async (
    dataInicio: string,
    dataFim: string
  ): Promise<MovimentacaoResponse[]> => {
    const response = await apiClient.get<MovimentacaoResponse[]>(
      `/api/movimentacoes/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
    );
    return response.data;
  },

  montarKit: async (data: MontagemKitRequest): Promise<void> => {
    await apiClient.post("/api/movimentacoes/montagem", data);
  },
};
