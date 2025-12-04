import api from '@/lib/axios';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
}

export const categoriaService = {
  async getAll(queryString?: string, page = 0, size = 10): Promise<Page<Categoria>> {
    const paginationQuery = `page=${page}&size=${size}`;
    const finalQuery = queryString 
      ? `${queryString}&${paginationQuery}` 
      : `?${paginationQuery}`;

    const response = await api.get(`/api/categorias${finalQuery}`);
    return response.data;
  },
  

  async getAllSimples(): Promise<Categoria[]> {
      const response = await api.get('/api/categorias/simples');
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