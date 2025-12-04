/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
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
import { loteService, type Lote } from "@/services/loteService";
import { etiquetaService } from "@/services/etiquetaService";
import {
  IconFileTypePdf,
  IconLoader,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

export function EtiquetasPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const loadLotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("busca", searchTerm); 

      const data = await loteService.getAll(
        params.toString() ? `?${params.toString()}` : "",
        page
      );

      setLotes(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Erro ao carregar lotes:", error);
      toast.error("Erro ao carregar lista de lotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLotes();
  }, [page]);

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
        "Gerando PDF com " + selectedBatchIds.length + " etiquetas..."
      );
      await etiquetaService.imprimirLotePDF(selectedBatchIds);
      toast.success("PDF gerado e baixado com sucesso!");
      setSelectedBatchIds([]);
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      toast.error("Erro ao gerar arquivo PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Impressão em Massa</h1>
              <p className="text-muted-foreground">
                Selecione múltiplos lotes para gerar uma única folha A4 com
                todas as etiquetas.
              </p>
            </div>

            <Card>
              <CardHeader>
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
                          Gerando...
                        </>
                      ) : (
                        <>
                          <IconFileTypePdf className="mr-2 h-4 w-4" />
                          Gerar PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando lotes...
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
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
                                      toggleSelectLote(
                                        lote.id,
                                        checked as boolean
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-mono font-medium">
                                  #{lote.id}
                                </TableCell>
                                <TableCell>
                                  {lote.itens?.[0]?.produtoNome ||
                                    "Sem produto"}
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
                                  {new Date(
                                    lote.dataEntrada
                                  ).toLocaleDateString("pt-BR")}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {lotes.length > 0 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Página <strong>{page + 1}</strong> de{" "}
                          <strong>{totalPages}</strong>.
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
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
