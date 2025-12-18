import { apiClient as api } from "@/shared/api/client";

export interface EtiquetaLote {
  loteId: number;
  produtos: {
    produtoNome: string;
    quantidade: number;
    dataValidade?: string;
    tamanho?: string;
    voltagem?: string;
  }[];
  dataEntrada: string;
  quantidadeTotal: number;
  unidadeMedida: string;
  observacoes?: string;
  codigoBarras: string;
}

export const etiquetaService = {
  async baixarEtiquetaLotePNG(
    loteId: number,
    tamanho: "PEQUENO" | "MEDIO" | "GRANDE" = "MEDIO"
  ): Promise<Blob> {
    const response = await api.get(`/api/etiquetas/lote/${loteId}`, {
      params: { tamanho },
      responseType: "blob",
    });
    return response.data;
  },

  async obterLotePDFBlob(loteIds: number[]): Promise<Blob> {
    const response = await api.post("/api/etiquetas/imprimir-lote", loteIds, {
      responseType: "blob",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  async imprimirLotePDF(loteIds: number[]): Promise<void> {
    const blob = await this.obterLotePDFBlob(loteIds);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `etiquetas-lote-${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
