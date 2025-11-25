import api from '@/lib/axios';

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  codigoBarrasFabricante?: string;
  categoriaId: number;
  categoriaNome?: string;
}

export const produtoService = {
  async getAll(queryString?: string): Promise<Produto[]> {
    const response = await api.get(`/api/produtos${queryString || ''}`);
    return response.data;
  },

  async getById(id: number): Promise<Produto> {
    const response = await api.get(`/api/produtos/${id}`);
    return response.data;
  },

  async create(data: Omit<Produto, 'id' | 'categoriaNome'>): Promise<Produto> {
    const response = await api.post('/api/produtos', data);
    return response.data;
  },

  async update(id: number, data: Omit<Produto, 'id' | 'categoriaNome'>): Promise<Produto> {
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
