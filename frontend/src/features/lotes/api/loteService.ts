import { apiClient } from "@/shared/api/client";
import type { Page, PaginationParams } from "@/shared/types";
import type { LoteRequest, LoteResponse, LoteFilters } from "../types";

export const loteService = {
  getAll: async (
    filters: LoteFilters = {},
    pagination: PaginationParams = { page: 0, size: 10 }
  ): Promise<Page<LoteResponse>> => {
    const params = new URLSearchParams();

    if (filters.produtoId)
      params.append("produtoId", filters.produtoId.toString());
    if (filters.dataEntradaInicio)
      params.append("dataEntradaInicio", filters.dataEntradaInicio);
    if (filters.dataEntradaFim)
      params.append("dataEntradaFim", filters.dataEntradaFim);
    if (filters.dataValidadeInicio)
      params.append("dataValidadeInicio", filters.dataValidadeInicio);
    if (filters.dataValidadeFim)
      params.append("dataValidadeFim", filters.dataValidadeFim);
    if (filters.comEstoque !== undefined)
      params.append("comEstoque", filters.comEstoque.toString());
    if (filters.busca) params.append("busca", filters.busca);

    params.append("page", (pagination.page ?? 0).toString());
    params.append("size", (pagination.size ?? 10).toString());

    const response = await apiClient.get<Page<LoteResponse>>(
      `/api/lotes?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<LoteResponse> => {
    const response = await apiClient.get<LoteResponse>(`/api/lotes/${id}`);
    return response.data;
  },

  create: async (data: LoteRequest): Promise<LoteResponse> => {
    const response = await apiClient.post<LoteResponse>("/api/lotes", data);
    return response.data;
  },

  update: async (id: number, data: LoteRequest): Promise<LoteResponse> => {
    const response = await apiClient.put<LoteResponse>(
      `/api/lotes/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/lotes/${id}`);
  },

  getProximosVencimento: async (dias: number): Promise<LoteResponse[]> => {
    const response = await apiClient.get<LoteResponse[]>(
      `/api/lotes/vencimento?dias=${dias}`
    );
    return response.data;
  },
};
