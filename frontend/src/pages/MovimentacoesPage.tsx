/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
import { Badge } from "@/components/ui/badge";
import {
  movimentacaoService,
  type Movimentacao,
} from "@/services/movimentacaoService";
import { loteService, type Lote } from "@/services/loteService";
import { usuarioService, type Usuario } from "@/services/usuarioService";
import {
  IconPlus,
  IconFilter,
  IconX,
  IconTools,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { MontagemKitDialog } from "@/components/MontagemKitDialog";

const tipoLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE_PERDA: "Ajuste (Perda)",
  AJUSTE_GANHO: "Ajuste (Ganho)",
};

const tipoColors: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  ENTRADA: "default",
  SAIDA: "destructive",
  AJUSTE_PERDA: "outline",
  AJUSTE_GANHO: "secondary",
};

export function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [montagemOpen, setMontagemOpen] = useState(false);

  const [loteSearchTerm, setLoteSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    loteId: "",
    tipo: "",
    quantidade: "",
  });

  const [filters, setFilters] = useState<{
    tipo: string;
    loteId: string;
    usuarioId: string;
    dataInicio: string;
    dataFim: string;
  }>({
    tipo: "",
    loteId: "",
    usuarioId: "",
    dataInicio: "",
    dataFim: "",
  });

  const [activeFilters, setActiveFilters] = useState(filters);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.tipo) params.append("tipo", activeFilters.tipo);
      if (activeFilters.loteId) params.append("loteId", activeFilters.loteId);
      if (activeFilters.usuarioId)
        params.append("usuarioId", activeFilters.usuarioId);
      if (activeFilters.dataInicio)
        params.append("dataInicio", activeFilters.dataInicio);
      if (activeFilters.dataFim)
        params.append("dataFim", activeFilters.dataFim);

      const [movimentacoesData, lotesData, usuariosData] = await Promise.all([
        movimentacaoService.getAll(
          params.toString() ? `?${params.toString()}` : "",
          page
        ),
        loteService.getAll("", 0, 1000),
        usuarioService.getAll("", 0, 1000),
      ]);

      setMovimentacoes(movimentacoesData.content);
      setTotalPages(movimentacoesData.totalPages);
      setTotalElements(movimentacoesData.totalElements);

      const listaLotes = Array.isArray(lotesData)
        ? lotesData
        : lotesData.content || [];
      setLotes(listaLotes);

      const listaUsuarios = Array.isArray(usuariosData)
        ? usuariosData
        : usuariosData.content || [];
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters, page]); 

  const handleOpenDialog = () => {
    setFormData({
      loteId: "",
      tipo: "",
      quantidade: "",
    });
    setLoteSearchTerm("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const { user } = useAuth();

  const handleSave = async () => {
    if (!formData.loteId) {
      toast.error("Lote é obrigatório");
      return;
    }
    if (!formData.tipo) {
      toast.error("Tipo é obrigatório");
      return;
    }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setSaving(true);
      await movimentacaoService.create({
        loteId: parseInt(formData.loteId),
        usuarioId: user.id,
        tipo: formData.tipo as any,
        quantidade: parseInt(formData.quantidade),
      } as any);
      toast.success("Movimentação registrada com sucesso!");
      await loadData();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Erro detalhado ao criar movimentação:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Erro de autenticação. Faça login novamente.");
      } else {
        toast.error(
          error.response?.data?.message || "Erro ao criar movimentação"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("pt-BR");
  };

  const lotesFiltrados = lotes.filter((lote) => {
    if (!loteSearchTerm) return false;
    const termo = loteSearchTerm.toLowerCase();
    const idMatch = lote.id.toString().includes(termo);
    const codigoMatch = lote.codigoBarras?.toLowerCase().includes(termo);
    const produtoMatch = lote.itens?.some((item) =>
      item.produtoNome?.toLowerCase().includes(termo)
    );
    return idMatch || codigoMatch || produtoMatch;
  });

  const handleLoteSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (lotesFiltrados.length === 1) {
        setFormData({ ...formData, loteId: lotesFiltrados[0].id.toString() });
        setLoteSearchTerm("");
        toast.success(`Lote #${lotesFiltrados[0].id} selecionado!`);
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold">Movimentações</h1>
                <p className="text-muted-foreground">
                  Registre e visualize as movimentações de estoque
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setMontagemOpen(true)}
                >
                  <IconTools className="mr-2 h-4 w-4" />
                  Montar Kit
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.tipo ||
                    activeFilters.loteId ||
                    activeFilters.usuarioId ||
                    activeFilters.dataInicio ||
                    activeFilters.dataFim) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {
                        [
                          activeFilters.tipo,
                          activeFilters.loteId,
                          activeFilters.usuarioId,
                          activeFilters.dataInicio,
                          activeFilters.dataFim,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </Button>
                <Button variant="outline" onClick={handleOpenDialog}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Nova Movimentação
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
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Nenhuma movimentação encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        movimentacoes.map((mov) => {
                          const lote = mov.lote;
                          const produtos =
                            lote?.itens?.length && lote.itens.length > 0
                              ? lote.itens
                                  .map((item) => item.produtoNome)
                                  .join(", ")
                              : mov.loteProdutoNome || "-";

                          return (
                            <TableRow key={mov.id}>
                              <TableCell>
                                {formatDateTime(mov.dataHora)}
                              </TableCell>
                              <TableCell className="font-mono">
                                #{mov.lote?.id || mov.loteId}
                              </TableCell>
                              <TableCell className="font-medium">
                                {produtos}
                                {lote?.itens && lote.itens.length > 1 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({lote.itens.length} produtos)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={tipoColors[mov.tipo]}>
                                  {tipoLabels[mov.tipo]}
                                </Badge>
                              </TableCell>
                              <TableCell>{mov.quantidade}</TableCell>
                              <TableCell>
                                {mov.usuario?.nome || "Sistema"}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {movimentacoes.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Total de <strong>{totalElements}</strong> registros.
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
          </main>
        </div>
      </div>

      <MontagemKitDialog
        open={montagemOpen}
        onOpenChange={setMontagemOpen}
        onSuccess={loadData}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma movimentação de estoque
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lote-search">Lote *</Label>

              {formData.loteId ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-1 rounded">
                        #{formData.loteId}
                      </span>
                      {
                        lotes.find((l) => l.id.toString() === formData.loteId)
                          ?.itens?.[0]?.produtoNome
                      }
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                      <span>
                        Atual:{" "}
                        <b>
                          {
                            lotes.find(
                              (l) => l.id.toString() === formData.loteId
                            )?.quantidadeAtual
                          }
                        </b>
                      </span>
                      <span className="font-mono border-l pl-3">
                        {lotes.find((l) => l.id.toString() === formData.loteId)
                          ?.codigoBarras || "-"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, loteId: "" })}
                    title="Trocar lote"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lote-search"
                    placeholder="Bipar código, digitar ID ou nome..."
                    className="pl-9"
                    value={loteSearchTerm}
                    onChange={(e) => setLoteSearchTerm(e.target.value)}
                    onKeyDown={handleLoteSearchKeyDown}
                    autoFocus
                    autoComplete="off"
                  />

                  {loteSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
                      {lotesFiltrados.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          Nenhum lote encontrado.
                        </div>
                      ) : (
                        lotesFiltrados.map((lote) => (
                          <div
                            key={lote.id}
                            className="p-2 hover:bg-accent cursor-pointer text-sm border-b last:border-0 flex flex-col"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                loteId: lote.id.toString(),
                              });
                              setLoteSearchTerm("");
                            }}
                          >
                            <div className="font-medium">
                              {lote.itens?.[0]?.produtoNome}
                              {lote.itens &&
                                lote.itens.length > 1 &&
                                ` (+${lote.itens.length - 1})`}
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between mt-1">
                              <span>
                                Lote #{lote.id} | Qtd: {lote.quantidadeAtual}
                              </span>
                              <span className="font-mono">
                                {lote.codigoBarras}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                  <SelectItem value="AJUSTE_PERDA">Ajuste (Perda)</SelectItem>
                  <SelectItem value="AJUSTE_GANHO">Ajuste (Ganho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade: e.target.value })
                }
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Movimentações</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar sua busca
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-tipo">Tipo</Label>
              <Select
                value={filters.tipo}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    tipo: value === "TODOS" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filter-tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                  <SelectItem value="AJUSTE_PERDA">Ajuste (Perda)</SelectItem>
                  <SelectItem value="AJUSTE_GANHO">Ajuste (Ganho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-lote">Lote</Label>
              <Select
                value={filters.loteId}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    loteId: value === "TODOS" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filter-lote">
                  <SelectValue placeholder="Selecione o lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id} value={lote.id.toString()}>
                      {lote.itens?.[0]?.produtoNome || `Lote #${lote.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-usuario">Usuário</Label>
              <Select
                value={filters.usuarioId}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    usuarioId: value === "TODOS" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filter-usuario">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataInicio">Data Início</Label>
              <Input
                id="filter-dataInicio"
                type="datetime-local"
                value={filters.dataInicio}
                onChange={(e) =>
                  setFilters({ ...filters, dataInicio: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataFim">Data Fim</Label>
              <Input
                id="filter-dataFim"
                type="datetime-local"
                value={filters.dataFim}
                onChange={(e) =>
                  setFilters({ ...filters, dataFim: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  tipo: "",
                  loteId: "",
                  usuarioId: "",
                  dataInicio: "",
                  dataFim: "",
                });
                setActiveFilters({
                  tipo: "",
                  loteId: "",
                  usuarioId: "",
                  dataInicio: "",
                  dataFim: "",
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
