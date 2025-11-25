import api from '@/lib/axios';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'VOLUNTARIO';
  senha?: string;
}

export const usuarioService = {
  async getAll(queryString?: string): Promise<Usuario[]> {
    const response = await api.get(`/api/usuarios${queryString || ''}`);
    return response.data;
  },

  async getById(id: number): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  async create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    const response = await api.post('/api/usuarios', data);
    return response.data;
  },

  async update(id: number, data: Partial<Omit<Usuario, 'id'>>): Promise<Usuario> {
    const response = await api.put(`/api/usuarios/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },
};
