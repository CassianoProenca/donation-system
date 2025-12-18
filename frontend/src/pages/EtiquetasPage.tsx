/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { loteService } from "@/features/lotes/api/loteService";
import type { LoteResponse } from "@/features/lotes/types";
import { etiquetaService } from "@/services/etiquetaService";
import { PdfPreviewDialog } from "@/shared/components/data-display/PdfPreviewDialog";
import {
  IconLoader,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconEye,
} from "@tabler/icons-react";

export function EtiquetasPage() {
  const [lotes, setLotes] = useState<LoteResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const loadLotes = async () => {
    try {
      setLoading(true);

      const filters = searchTerm ? { busca: searchTerm } : {};
      const pagination = { page, size: pageSize };

      const data = await loteService.getAll(filters, pagination);

      setLotes(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      toast.error("Erro ao carregar lista de lotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLotes();
  }, [page, pageSize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(0);
      loadLotes();
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const idsPagina = lotes.map((l) => l.id);
      const novos = idsPagina.filter((id) => !selectedBatchIds.includes(id));
      setSelectedBatchIds((prev) => [...prev, ...novos]);
    } else {
      const idsPagina = lotes.map((l) => l.id);
      setSelectedBatchIds((prev) =>
        prev.filter((id) => !idsPagina.includes(id))
      );
    }
  };

  const toggleSelectLote = (loteId: number, checked: boolean) => {
    if (checked) {
      setSelectedBatchIds((prev) => [...prev, loteId]);
    } else {
      setSelectedBatchIds((prev) => prev.filter((id) => id !== loteId));
    }
  };

  const isPageSelected =
    lotes.length > 0 && lotes.every((l) => selectedBatchIds.includes(l.id));

  const handleGerarPdfEmMassa = async () => {
    if (selectedBatchIds.length === 0) {
      toast.warning("Selecione pelo menos um lote.");
      return;
    }

    try {
      setGeneratingPdf(true);
      toast.info(
        "Gerando visualização de " + selectedBatchIds.length + " etiquetas..."
      );
      const blob = await etiquetaService.obterLotePDFBlob(selectedBatchIds);
      setPdfBlob(blob);
      setPreviewOpen(true);
      toast.success("Visualização gerada com sucesso!");
    } catch {
      toast.error("Erro ao gerar visualização das etiquetas.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Impressão de Etiquetas em Massa
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione múltiplos lotes para gerar uma única folha A4 com todas
              as etiquetas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar and actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-4 items-center w-full md:w-auto">
            {/* Busca */}
            <div className="relative w-full md:w-[300px]">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por produto ou código..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedBatchIds.length} selecionados
            </div>
            <Button
              onClick={handleGerarPdfEmMassa}
              disabled={selectedBatchIds.length === 0 || generatingPdf}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
            >
              {generatingPdf ? (
                <>
                  <IconLoader className="animate-spin mr-2 h-4 w-4" />
                  Processando...
                </>
              ) : (
                <>
                  <IconEye className="mr-2 h-4 w-4" />
                  Visualizar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Active filters badges */}
        {searchTerm && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              Busca: {searchTerm}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando lotes...
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">
                      <Checkbox
                        checked={isPageSelected}
                        onCheckedChange={(checked) =>
                          toggleSelectAll(checked as boolean)
                        }
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Produto Principal</TableHead>
                    <TableHead>Qtd. Atual</TableHead>
                    <TableHead>Data Entrada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lotes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhum lote encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lotes.map((lote) => (
                      <TableRow
                        key={lote.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() =>
                          toggleSelectLote(
                            lote.id,
                            !selectedBatchIds.includes(lote.id)
                          )
                        }
                      >
                        <TableCell
                          className="text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedBatchIds.includes(lote.id)}
                            onCheckedChange={(checked) =>
                              toggleSelectLote(lote.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          #{lote.id}
                        </TableCell>
                        <TableCell>
                          {lote.itens?.[0]?.produtoNome || "Sem produto"}
                          {lote.itens && lote.itens.length > 1 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (+{lote.itens.length - 1} outros)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lote.quantidadeAtual}{" "}
                          {lote.unidadeMedida?.toLowerCase()}
                        </TableCell>
                        <TableCell>
                          {new Date(lote.dataEntrada).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {lotes.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Página <strong>{page + 1}</strong> de{" "}
                    <strong>{totalPages || 1}</strong> • Total:{" "}
                    <strong>{totalElements}</strong> itens
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Itens por página:
                    </span>
                    <select
                      className="h-8 px-2 rounded-md border border-input bg-background text-sm"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(0);
                      }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <IconChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    Próximo
                    <IconChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <PdfPreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfBlob={pdfBlob}
        title={`Etiquetas - ${selectedBatchIds.length} Lote(s)`}
      />
    </Card>
  );
}
