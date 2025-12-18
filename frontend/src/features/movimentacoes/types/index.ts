export type TipoMovimentacao =
  | "ENTRADA"
  | "SAIDA"
  | "AJUSTE_PERDA"
  | "AJUSTE_GANHO";

export interface MovimentacaoRequest {
  loteId: number;
  usuarioId?: number;
  tipo: TipoMovimentacao;
  quantidade: number;
}

export interface LoteSimples {
  id: number;
  quantidadeInicial: number;
  quantidadeAtual: number;
  dataEntrada: string;
  unidadeMedida: string;
  itens: Array<{
    id: number;
    produtoId: number;
    produtoNome: string;
    quantidade: number;
  }>;
}

export interface UsuarioSimples {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface MovimentacaoResponse {
  id: number;
  lote: LoteSimples;
  usuario: UsuarioSimples;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataHora: string;
}

export interface MontagemKitRequest {
  produtoKitId: number;
  quantidade: number;
}

export interface MovimentacaoFilters {
  loteId?: number;
  usuarioId?: number;
  tipo?: TipoMovimentacao;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}
