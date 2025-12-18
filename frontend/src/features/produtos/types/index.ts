

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
}

export interface Componente {
  produtoId: number;
  nome?: string;
  quantidade: number;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  codigoBarrasFabricante?: string;
  categoria: Categoria;
  isKit: boolean;
  componentes: Componente[];
}

export interface ProdutoSimples {
  id: number;
  nome: string;
  categoria: {
    id: number;
    nome: string;
    icone?: string;
  };
}

export interface ProdutoFormData {
  nome: string;
  descricao?: string;
  codigoBarrasFabricante?: string;
  categoriaId: number;
  isKit: boolean;
  componentes?: Componente[];
}

export interface ProdutoFilters {
  nome?: string;
  categoriaId?: number;
  isKit?: string;
  estoqueCritico?: boolean;
  estoqueAte?: number;
  somenteComEstoque?: boolean;
  [key: string]: unknown;
}
