
import { useFilters } from "@/shared/hooks";
import type { ProdutoFilters } from "../types";

const initialFilters: ProdutoFilters = {
  nome: "",
  categoriaId: undefined,
  estoqueCritico: false,
  estoqueAte: undefined,
  somenteComEstoque: false,
};

export function useProdutoFilters() {
  return useFilters<ProdutoFilters>(initialFilters);
}
