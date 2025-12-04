/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface Componente {
  produtoId: number;
  nome?: string;
  quantidade: number;
}
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  codigoBarrasFabricante?: string;
  categoriaId: number;
  categoriaNome?: string;
  isKit: boolean;
  componentes: Componente[];
}

export const produtoService = {
  async getAll(
    queryString?: string,
    page = 0,
    size = 10
  ): Promise<Page<Produto>> {
    const paginationQuery = `page=${page}&size=${size}`;
    const finalQuery = queryString
      ? `${queryString}&${paginationQuery}`
      : `?${paginationQuery}`;

    const response = await api.get(`/api/produtos${finalQuery}`);
    return response.data;
  },

  async getById(id: number): Promise<Produto> {
    const response = await api.get(`/api/produtos/${id}`);
    return response.data;
  },

  async create(data: any): Promise<Produto> {
    const response = await api.post("/api/produtos", data);
    return response.data;
  },

  async update(id: number, data: any): Promise<Produto> {
    const response = await api.put(`/api/produtos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/produtos/${id}`);
  },

  async buscarPorCategoria(categoriaId: number): Promise<Produto[]> {
    const response = await api.get(`/api/produtos/categoria/${categoriaId}`);
    return response.data;
  },
};
