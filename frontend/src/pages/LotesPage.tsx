/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  loteService,
  type Lote,
  type UnidadeMedida,
} from "@/services/loteService";
import { produtoService, type Produto } from "@/services/produtoService";
import { etiquetaService } from "@/services/etiquetaService";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconFilter,
  IconX,
  IconPrinter,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconScale,
  IconNote,
  IconPackage,
} from "@tabler/icons-react";

export function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    produtoId: string;
    dataEntradaInicio: string;
    dataEntradaFim: string;
    comEstoque: string;
  }>({
    produtoId: "",
    dataEntradaInicio: "",
    dataEntradaFim: "",
    comEstoque: "",
  });
  const [activeFilters, setActiveFilters] = useState(filters);

  const [formData, setFormData] = useState({
    dataEntrada: "",
    unidadeMedida: "" as UnidadeMedida | "",
    observacoes: "",
  });
  const [itens, setItens] = useState<
    Array<{
      produtoId: string;
      quantidade: string;
      dataValidade: string;
      tamanho: string;
      voltagem: string;
    }>
  >([
    {
      produtoId: "",
      quantidade: "",
      dataValidade: "",
      tamanho: "",
      voltagem: "",
    },
  ]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeFilters.produtoId)
        params.append("produtoId", activeFilters.produtoId);
      if (activeFilters.dataEntradaInicio)
        params.append("dataEntradaInicio", activeFilters.dataEntradaInicio);
      if (activeFilters.dataEntradaFim)
        params.append("dataEntradaFim", activeFilters.dataEntradaFim);
      if (activeFilters.comEstoque)
        params.append("comEstoque", activeFilters.comEstoque);
      if (searchTerm) params.append("busca", searchTerm);

      const [lotesData, produtosData] = await Promise.all([
        loteService.getAll(
          params.toString() ? `?${params.toString()}` : "",
          page
        ),
        produtoService.getAll("", 0, 1000),
      ]);

      const listaLotes = Array.isArray(lotesData)
        ? lotesData
        : lotesData.content || [];
      setLotes(listaLotes);
      setTotalPages(lotesData.totalPages || 0);
      setTotalElements(lotesData.totalElements || 0);

      const listaProdutos = Array.isArray(produtosData)
        ? produtosData
        : produtosData.content || [];
      setProdutos(listaProdutos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar lotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters, page]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(0);
      loadData();
    }
  };

  const handleOpenDialog = (lote?: Lote) => {
    if (lote) {
      setEditingLote(lote);
      setFormData({
        dataEntrada: lote.dataEntrada,
        unidadeMedida: lote.unidadeMedida || "",
        observacoes: lote.observacoes || "",
      });
      setItens(
        lote.itens.map((item) => ({
          produtoId: item.produtoId.toString(),
          quantidade: item.quantidade.toString(),
          dataValidade: item.dataValidade || "",
          tamanho: item.tamanho || "",
          voltagem: item.voltagem || "",
        }))
      );
    } else {
      setEditingLote(null);
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        dataEntrada: today,
        unidadeMedida: "",
        observacoes: "",
      });
      setItens([
        {
          produtoId: "",
          quantidade: "",
          dataValidade: "",
          tamanho: "",
          voltagem: "",
        },
      ]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLote(null);
  };

  const handleSave = async () => {
    const itensValidos = itens.filter(
      (item) => item.produtoId && item.quantidade
    );
    if (itensValidos.length === 0) {
      toast.error("Adicione pelo menos um produto");
      return;
    }

    for (const item of itensValidos) {
      if (parseInt(item.quantidade) <= 0) {
        toast.error("Quantidade deve ser maior que zero");
        return;
      }
    }

    if (!formData.dataEntrada) {
      toast.error("Data de entrada é obrigatória");
      return;
    }
    if (!formData.unidadeMedida) {
      toast.error("Unidade de medida é obrigatória");
      return;
    }

    try {
      setSaving(true);
      const dataToSend: any = {
        itens: itensValidos.map((item) => ({
          produtoId: parseInt(item.produtoId),
          quantidade: parseInt(item.quantidade),
          dataValidade: item.dataValidade || undefined,
          tamanho: item.tamanho || undefined,
          voltagem: item.voltagem || undefined,
        })),
        dataEntrada: formData.dataEntrada,
        unidadeMedida: formData.unidadeMedida,
        observacoes: formData.observacoes || undefined,
      };

      if (editingLote) {
        await loteService.update(editingLote.id, dataToSend);
        toast.success("Lote atualizado com sucesso!");
      } else {
        await loteService.create(dataToSend);
        toast.success("Lote criado com sucesso!");
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao salvar lote:", error);
      toast.error("Erro ao salvar lote");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSaving(true);
      await loteService.delete(deletingId);
      toast.success("Lote deletado com sucesso!");
      await loadData();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Erro ao deletar lote:", error);
      toast.error("Erro ao deletar lote");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintEtiqueta = async (loteId: number) => {
    try {
      toast.info("Gerando etiqueta PDF...");
      await etiquetaService.imprimirLotePDF([loteId]);
    } catch (error) {
      console.error("Erro ao imprimir etiqueta:", error);
      toast.error("Erro ao gerar PDF da etiqueta.");
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const addItem = () => {
    setItens([
      ...itens,
      {
        produtoId: "",
        quantidade: "",
        dataValidade: "",
        tamanho: "",
        voltagem: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Calcular total estimado
  const totalItensEstimado = itens.reduce(
    (acc, i) => acc + (parseInt(i.quantidade) || 0),
    0
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold">Lotes</h1>
                <p className="text-muted-foreground">
                  Gerencie os lotes de produtos
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative w-full max-w-sm">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Bipar ou digitar código..."
                    className="pl-9 w-[200px] md:w-[260px] bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.produtoId ||
                    activeFilters.dataEntradaInicio ||
                    activeFilters.dataEntradaFim ||
                    activeFilters.comEstoque) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {
                        [
                          activeFilters.produtoId,
                          activeFilters.dataEntradaInicio,
                          activeFilters.dataEntradaFim,
                          activeFilters.comEstoque,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Novo Lote
                </Button>
              </div>
            </div>

            {loading ? (
              <div>Carregando...</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd. Inicial</TableHead>
                        <TableHead>Qtd. Atual</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Data Entrada</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lotes.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Nenhum lote encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        lotes.map((lote) => (
                          <TableRow key={lote.id}>
                            <TableCell className="font-mono text-xs">
                              {lote.codigoBarras || "-"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {lote.itens.length === 1
                                ? lote.itens[0].produtoNome
                                : `${lote.itens.length} produtos`}
                              {lote.itens.length > 1 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {lote.itens
                                    .map((item) => item.produtoNome)
                                    .join(", ")}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{lote.quantidadeInicial}</TableCell>
                            <TableCell>{lote.quantidadeAtual}</TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {lote.unidadeMedida === "UNIDADE" && "Un"}
                                {lote.unidadeMedida === "QUILOGRAMA" && "Kg"}
                                {lote.unidadeMedida === "LITRO" && "L"}
                                {lote.unidadeMedida === "PACOTE" && "Pct"}
                                {lote.unidadeMedida === "CAIXA" && "Cx"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {formatDate(lote.dataEntrada)}
                            </TableCell>
                            <TableCell>
                              {lote.itens.some((item) => item.dataValidade)
                                ? lote.itens
                                    .map((item) => item.dataValidade)
                                    .filter(Boolean)
                                    .map((d) => formatDate(d!))
                                    .join(", ")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handlePrintEtiqueta(lote.id)}
                                  title="Imprimir Etiqueta"
                                >
                                  <IconPrinter className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenDialog(lote)}
                                  title="Editar"
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDeleteDialog(lote.id)
                                  }
                                  title="Excluir"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* CONTROLES DE PAGINAÇÃO */}
                {lotes.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Total de <strong>{totalElements}</strong> lotes. Página{" "}
                      <strong>{page + 1}</strong> de{" "}
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
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingLote ? "Editar Lote" : "Novo Lote"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados de entrada do novo lote.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid gap-6 py-4">
              {/* SEÇÃO 1: Informações Gerais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <IconNote className="h-4 w-4" /> Informações Gerais
                </div>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dataEntrada"
                      className="flex items-center gap-2"
                    >
                      <IconCalendar className="h-3 w-3 text-muted-foreground" />{" "}
                      Data de Entrada *
                    </Label>
                    <Input
                      id="dataEntrada"
                      type="date"
                      value={formData.dataEntrada}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataEntrada: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="unidadeMedida"
                      className="flex items-center gap-2"
                    >
                      <IconScale className="h-3 w-3 text-muted-foreground" />{" "}
                      Unidade de Medida *
                    </Label>
                    <Select
                      value={formData.unidadeMedida}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          unidadeMedida: value as UnidadeMedida,
                        })
                      }
                    >
                      <SelectTrigger id="unidadeMedida">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNIDADE">Unidade</SelectItem>
                        <SelectItem value="QUILOGRAMA">
                          Quilograma (Kg)
                        </SelectItem>
                        <SelectItem value="LITRO">Litro (L)</SelectItem>
                        <SelectItem value="PACOTE">Pacote</SelectItem>
                        <SelectItem value="CAIXA">Caixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Ex: Doação recebida do parceiro X"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <IconPackage className="h-4 w-4" /> Produtos do Lote
                    <Badge variant="secondary" className="ml-2">
                      {itens.length}
                    </Badge>
                  </div>
                  {!editingLote && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="h-8 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                    >
                      <IconPlus className="h-4 w-4 mr-1" />
                      Adicionar Item
                    </Button>
                  )}
                </div>
                <Separator />

                <div className="space-y-3">
                  {itens.map((item, index) => (
                    <div
                      key={index}
                      className="relative border rounded-lg p-4 space-y-3 bg-card hover:bg-accent/5 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                          Item {index + 1}
                        </span>
                        {itens.length > 1 && !editingLote && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:bg-destructive/10 absolute top-3 right-3"
                            onClick={() => removeItem(index)}
                            title="Remover item"
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Produto *</Label>
                        <Select
                          value={item.produtoId}
                          onValueChange={(value) =>
                            updateItem(index, "produtoId", value)
                          }
                          disabled={!!editingLote}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o produto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {produtos.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                Nenhum produto cadastrado
                              </div>
                            ) : (
                              produtos.map((prod) => (
                                <SelectItem
                                  key={prod.id}
                                  value={prod.id.toString()}
                                >
                                  {prod.nome}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantidade *</Label>
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) =>
                              updateItem(index, "quantidade", e.target.value)
                            }
                            disabled={!!editingLote}
                            placeholder="0"
                            min="1"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Validade</Label>
                          <Input
                            type="date"
                            value={item.dataValidade}
                            onChange={(e) =>
                              updateItem(index, "dataValidade", e.target.value)
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tamanho</Label>
                          <Input
                            value={item.tamanho}
                            onChange={(e) =>
                              updateItem(index, "tamanho", e.target.value)
                            }
                            placeholder="Ex: M"
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Voltagem</Label>
                          <Input
                            value={item.voltagem}
                            onChange={(e) =>
                              updateItem(index, "voltagem", e.target.value)
                            }
                            placeholder="Ex: 110v"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-auto">
            <div className="mr-auto text-sm text-muted-foreground flex items-center">
              <span>
                Total Estimado: <strong>{totalItensEstimado}</strong> itens
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px]"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este lote? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Lotes</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar sua busca
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-produto">Produto</Label>
              <Select
                value={filters.produtoId}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    produtoId: value === "TODOS" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filter-produto">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {produtos.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>
                      {prod.nome}{" "}
                      {prod.categoriaNome ? ` (${prod.categoriaNome})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataEntradaInicio">
                Data Entrada Início
              </Label>
              <Input
                id="filter-dataEntradaInicio"
                type="date"
                value={filters.dataEntradaInicio}
                onChange={(e) =>
                  setFilters({ ...filters, dataEntradaInicio: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataEntradaFim">Data Entrada Fim</Label>
              <Input
                id="filter-dataEntradaFim"
                type="date"
                value={filters.dataEntradaFim}
                onChange={(e) =>
                  setFilters({ ...filters, dataEntradaFim: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-comEstoque">Estoque</Label>
              <Select
                value={filters.comEstoque}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    comEstoque: value === "TODOS" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filter-comEstoque">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="true">Apenas Com Estoque</SelectItem>
                  <SelectItem value="false">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  produtoId: "",
                  dataEntradaInicio: "",
                  dataEntradaFim: "",
                  comEstoque: "",
                });
                setActiveFilters({
                  produtoId: "",
                  dataEntradaInicio: "",
                  dataEntradaFim: "",
                  comEstoque: "",
                });
                setFilterDialogOpen(false);
              }}
            >
              <IconX className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPage(0); // Reseta página ao filtrar
                setActiveFilters(filters);
                setFilterDialogOpen(false);
              }}
            >
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
