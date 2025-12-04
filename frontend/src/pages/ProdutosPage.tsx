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
import { Checkbox } from "@/components/ui/checkbox";
import { produtoService, type Produto } from "@/services/produtoService";
import { categoriaService, type Categoria } from "@/services/categoriaService";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconFilter,
  IconX,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    codigoBarrasFabricante: "",
    categoriaId: "",
    isKit: false,
  });

  const [componentesKit, setComponentesKit] = useState<
    Array<{ produtoId: string; quantidade: string }>
  >([{ produtoId: "", quantidade: "" }]);

  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<{ categoriaId: string }>({
    categoriaId: "",
  });
  const [activeFilters, setActiveFilters] = useState<{ categoriaId: string }>({
    categoriaId: "",
  });

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) params.append("nome", searchTerm);
      if (activeFilters.categoriaId)
        params.append("categoriaId", activeFilters.categoriaId);

      const [produtosData, categoriasData] = await Promise.all([
        produtoService.getAll(
          params.toString() ? `?${params.toString()}` : "",
          page
        ),
        // CORREÇÃO: Solicita uma página grande (1000 itens) para o dropdown de categorias
        // ou usa a paginação se o service suportar, mas precisamos extrair o .content
        categoriaService.getAll("", 0, 1000),
      ]);

      setProdutos(produtosData.content || []);
      setTotalPages(produtosData.totalPages);
      setTotalElements(produtosData.totalElements);

      // CORREÇÃO: Extrai o array .content da resposta paginada de categorias
      // Se categoriasData for um array (caso o backend não tenha atualizado), usa ele direto
      const listaCategorias = Array.isArray(categoriasData)
        ? categoriasData
        : categoriasData.content || [];

      setCategorias(listaCategorias);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, [activeFilters, page]); // Recarrega ao mudar filtro ou página

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(0); // Volta para a primeira página na busca
      loadProdutos();
    }
  };

  const handleOpenDialog = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || "",
        codigoBarrasFabricante: produto.codigoBarrasFabricante || "",
        categoriaId: produto.categoriaId.toString(),
        isKit: produto.isKit || false,
      });
      if (produto.isKit && produto.componentes) {
        setComponentesKit(
          produto.componentes.map((c) => ({
            produtoId: c.produtoId.toString(),
            quantidade: c.quantidade.toString(),
          }))
        );
      } else {
        setComponentesKit([{ produtoId: "", quantidade: "" }]);
      }
    } else {
      setEditingProduto(null);
      setFormData({
        nome: "",
        descricao: "",
        codigoBarrasFabricante: "",
        categoriaId: "",
        isKit: false,
      });
      setComponentesKit([{ produtoId: "", quantidade: "" }]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduto(null);
  };

  // Funções para gerenciar a lista de componentes
  const addComponente = () => {
    setComponentesKit([...componentesKit, { produtoId: "", quantidade: "" }]);
  };

  const removeComponente = (index: number) => {
    if (componentesKit.length > 1) {
      setComponentesKit(componentesKit.filter((_, i) => i !== index));
    }
  };

  const updateComponente = (
    index: number,
    field: "produtoId" | "quantidade",
    value: string
  ) => {
    const novos = [...componentesKit];
    novos[index] = { ...novos[index], [field]: value };
    setComponentesKit(novos);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.categoriaId) {
      toast.error("Categoria é obrigatória");
      return;
    }

    let componentesValidos: any[] = [];
    if (formData.isKit) {
      componentesValidos = componentesKit
        .filter((c) => c.produtoId && c.quantidade)
        .map((c) => ({
          produtoId: parseInt(c.produtoId),
          quantidade: parseInt(c.quantidade),
        }));

      if (componentesValidos.length === 0) {
        toast.error("Um Kit deve ter pelo menos um componente");
        return;
      }
    }

    try {
      setSaving(true);
      const dataToSend = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        codigoBarrasFabricante: formData.codigoBarrasFabricante || undefined,
        categoriaId: parseInt(formData.categoriaId),
        isKit: formData.isKit,
        componentes: formData.isKit ? componentesValidos : [],
      };

      if (editingProduto) {
        await produtoService.update(editingProduto.id, dataToSend);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await produtoService.create(dataToSend);
        toast.success("Produto criado com sucesso!");
      }
      await loadProdutos();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await produtoService.delete(deletingId);
      toast.success("Produto deletado com sucesso!");
      await loadProdutos();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao deletar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
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
                <h1 className="text-3xl font-bold">Produtos</h1>
                <p className="text-muted-foreground">
                  Gerencie os produtos do sistema
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative w-full max-w-sm">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome..."
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
                  {activeFilters.categoriaId && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      1
                    </span>
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Novo Produto
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
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Código Barras</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Nenhum produto encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        produtos.map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell>
                              {produto.isKit ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                                >
                                  KIT
                                </Badge>
                              ) : (
                                <Badge variant="outline">Item</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {produto.nome}
                            </TableCell>
                            <TableCell>
                              {produto.categoria?.nome || produto.categoriaNome}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {produto.codigoBarrasFabricante || "-"}
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={produto.descricao}
                            >
                              {produto.descricao || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenDialog(produto)}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDeleteDialog(produto.id)
                                  }
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

                {produtos.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Total de <strong>{totalElements}</strong> produtos. Página{" "}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Arroz Integral"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoriaId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhuma categoria encontrada
                    </div>
                  ) : (
                    categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox
                id="isKit"
                checked={formData.isKit}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isKit: checked as boolean })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="isKit" className="cursor-pointer">
                  Este produto é um Kit Composto?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Kits são compostos por outros produtos e têm seu estoque
                  controlado pela montagem.
                </p>
              </div>
            </div>

            {formData.isKit && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-purple-700">
                    Composição do Kit
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addComponente}
                  >
                    <IconPlus className="h-3 w-3 mr-1" /> Adicionar Item
                  </Button>
                </div>

                {componentesKit.map((comp, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Produto Componente</Label>
                      <Select
                        value={comp.produtoId}
                        onValueChange={(val) =>
                          updateComponente(index, "produtoId", val)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos
                            .filter(
                              (p) => !p.isKit && p.id !== editingProduto?.id
                            )
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        className="h-8"
                        value={comp.quantidade}
                        onChange={(e) =>
                          updateComponente(index, "quantidade", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeComponente(index)}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="codigoBarras">Código de Barras (Opcional)</Label>
              <Input
                id="codigoBarras"
                value={formData.codigoBarrasFabricante}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigoBarrasFabricante: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
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
            <Button onClick={handleSave} disabled={saving}>
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
              Tem certeza que deseja excluir este produto? Esta ação não pode
              ser desfeita.
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
            <DialogTitle>Filtrar Produtos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-nome">Nome</Label>
              <Input
                id="filter-nome"
                value={filters.nome}
                onChange={(e) =>
                  setFilters({ ...filters, nome: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-categoria">Categoria</Label>
              <Select
                value={filters.categoriaId}
                onValueChange={(val) =>
                  setFilters({
                    ...filters,
                    categoriaId: val === "TODOS" ? "" : val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ nome: "", categoriaId: "" });
                setActiveFilters({ nome: "", categoriaId: "" });
                setFilterDialogOpen(false);
              }}
            >
              Limpar
            </Button>
            <Button
              onClick={() => {
                setActiveFilters(filters);
                setFilterDialogOpen(false);
              }}
            >
              Filtrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
