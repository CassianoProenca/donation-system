export interface DashboardStats {
  totalCategorias: number;
  totalProdutos: number;
  totalLotes: number;
  totalMovimentacoes: number;
  estoqueTotal: number;
}

export interface DashboardMetrics {
  totalCategorias: number;
  totalProdutos: number;
  totalLotes: number;
  estoqueTotal: number;
  movimentacoesHoje: number;
  alertasCriticos: AlertasCriticos;
  evolucaoEstoque: EvolucaoEstoque[];
  top5ProdutosMaisDistribuidos: TopProduto[];
  ultimasMovimentacoes: MovimentacaoResumo[];
  movimentacoesPorDia: MovimentacaoPorDia[];
  movimentacoesPorTipo: TipoMovimentacaoCount[];
}

export interface AlertasCriticos {
  lotesVencendo: number;
  produtosEstoqueBaixo: number;
  lotesSemEstoque: number;
}

export interface EvolucaoEstoque {
  dia: string;
  estoque: number;
}

export interface TopProduto {
  produtoNome: string;
  totalSaidas: number;
  ultimaSaida: string;
}

export interface MovimentacaoResumo {
  id: number;
  dataHora: string;
  produtoNome: string;
  tipo: string;
  quantidade: number;
  usuarioNome: string;
}

export interface MovimentacaoPorDia {
  dia: string;
  quantidade: number;
  entradas: number;
  saidas: number;
}

export interface TipoMovimentacaoCount {
  tipo: string;
  label: string;
  quantidade: number;
}

// Mantido para compatibilidade
export interface MovimentacaoPorDiaOld {
  data: string;
  quantidade: number;
}

export interface EstoquePorCategoria {
  categoria: string;
  quantidade: number;
}
