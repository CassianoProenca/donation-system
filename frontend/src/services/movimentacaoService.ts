import api from "@/lib/axios";

export interface Movimentacao {
  id: number;
  loteId: number;
  usuarioId: number;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE_PERDA" | "AJUSTE_GANHO";
  quantidade: number;
  dataHora: string;
  lote?: {
    id: number;
    itens?: Array<{
      id: number;
      produtoId: number;
      produtoNome: string;
      quantidade: number;
      dataValidade?: string;
      tamanho?: string;
      voltagem?: string;
    }>;
    quantidadeInicial: number;
    quantidadeAtual: number;
    dataEntrada: string;
    unidadeMedida: string;
    observacoes?: string;
    codigoBarras?: string;
  };
  usuario?: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
  };
  loteProdutoNome?: string;
  usuarioNome?: string;
}

export const movimentacaoService = {
  async getAll(queryString?: string): Promise<Movimentacao[]> {
    const response = await api.get(`/api/movimentacoes${queryString || ""}`);
    return response.data;
  },

  async getById(id: number): Promise<Movimentacao> {
    const response = await api.get(`/api/movimentacoes/${id}`);
    return response.data;
  },

  async create(
    data: Omit<
      Movimentacao,
      "id" | "dataHora" | "loteProdutoNome" | "usuarioNome"
    >
  ): Promise<Movimentacao> {
    const response = await api.post("/api/movimentacoes", data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/movimentacoes/${id}`);
  },

  async buscarPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<Movimentacao[]> {
    const response = await api.get("/api/movimentacoes/periodo", {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  async buscarPorLote(loteId: number): Promise<Movimentacao[]> {
    const response = await api.get(`/api/movimentacoes/lote/${loteId}`);
    return response.data;
  },

  async montarKit(data: {
    produtoKitId: number;
    quantidade: number;
  }): Promise<void> {
    await api.post("/api/movimentacoes/montagem", data);
  },
};
