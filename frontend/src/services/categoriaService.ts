import api from '@/lib/axios';

export type TipoCategoria = 'ALIMENTO' | 'VESTUARIO' | 'ELETRONICO' | 'HIGIENE' | 'OUTROS';

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  tipo: TipoCategoria;
}

export const categoriaService = {
  async getAll(queryString?: string): Promise<Categoria[]> {
    const response = await api.get(`/api/categorias${queryString || ''}`);
    return response.data;
  },

  async getById(id: number): Promise<Categoria> {
    const response = await api.get(`/api/categorias/${id}`);
    return response.data;
  },

  async create(data: Omit<Categoria, 'id'>): Promise<Categoria> {
    const response = await api.post('/api/categorias', data);
    return response.data;
  },

  async update(id: number, data: Omit<Categoria, 'id'>): Promise<Categoria> {
    const response = await api.put(`/api/categorias/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/categorias/${id}`);
  },
};
