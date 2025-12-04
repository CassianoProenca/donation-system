import api from "@/lib/axios";

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: "ADMIN" | "VOLUNTARIO";
  senha?: string;
}

export const usuarioService = {
  async getAll(
    queryString?: string,
    page = 0,
    size = 10
  ): Promise<Page<Usuario>> {
    const paginationQuery = `page=${page}&size=${size}`;
    const finalQuery = queryString
      ? `${queryString}&${paginationQuery}`
      : `?${paginationQuery}`;

    const response = await api.get(`/api/usuarios${finalQuery}`);
    return response.data;
  },

  async getById(id: number): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  async getByEmail(email: string): Promise<Usuario> {
    const response = await api.get(`/api/usuarios/email/${email}`);
    return response.data;
  },

  async create(data: Omit<Usuario, "id">): Promise<Usuario> {
    const response = await api.post("/api/usuarios", data);
    return response.data;
  },

  async update(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put(`/api/usuarios/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },
};
