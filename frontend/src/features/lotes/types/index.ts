export type UnidadeMedida =
  | "UNIDADE"
  | "QUILOGRAMA"
  | "LITRO"
  | "PACOTE"
  | "CAIXA";

export interface LoteItemRequest {
  produtoId: number;
  quantidade: number;
  dataValidade?: string;
  tamanho?: string;
  voltagem?: string;
}

export interface LoteItemResponse {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  dataValidade?: string;
  tamanho?: string;
  voltagem?: string;
}

export interface LoteRequest {
  itens: LoteItemRequest[];
  dataEntrada: string;
  unidadeMedida: UnidadeMedida;
  observacoes?: string;
}

export interface LoteResponse {
  id: number;
  itens: LoteItemResponse[];
  quantidadeInicial: number;
  quantidadeAtual: number;
  dataEntrada: string;
  unidadeMedida: UnidadeMedida;
  observacoes?: string;
  codigoBarras?: string;
}

export interface LoteFilters {
  produtoId?: number;
  dataEntradaInicio?: string;
  dataEntradaFim?: string;
  dataValidadeInicio?: string;
  dataValidadeFim?: string;
  comEstoque?: boolean;
  busca?: string;
}
