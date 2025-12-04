/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface DashboardStats {
  totalCategorias: number;
  totalProdutos: number;
  totalLotes: number;
  totalMovimentacoesHoje: number;
  produtosComEstoqueBaixo: number;
  lotesProximosVencimento: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [categorias, produtos, lotes, movimentacoes] = await Promise.all([
      api.get("/api/categorias"),
      api.get("/api/produtos"),
      api.get("/api/lotes"),
      api.get("/api/movimentacoes"),
    ]);

    const hoje = new Date().toISOString().split("T")[0];
    const movimentacoesHoje = movimentacoes.data.filter((m: any) =>
      m.dataHora?.startsWith(hoje)
    );

    const proximoVencimento = new Date();
    proximoVencimento.setDate(proximoVencimento.getDate() + 30);
    const lotesVencendo = lotes.data.filter((l: any) => {
      if (!l.dataValidade) return false;
      const vencimento = new Date(l.dataValidade);
      return vencimento <= proximoVencimento && vencimento >= new Date();
    });

    const lotesEstoqueBaixo = lotes.data.filter(
      (l: any) => l.quantidadeAtual < l.quantidadeInicial * 0.2
    );

    return {
      totalCategorias: categorias.data.length,
      totalProdutos: produtos.data.length,
      totalLotes: lotes.data.length,
      totalMovimentacoesHoje: movimentacoesHoje.length,
      produtosComEstoqueBaixo: lotesEstoqueBaixo.length,
      lotesProximosVencimento: lotesVencendo.length,
    };
  },
};
