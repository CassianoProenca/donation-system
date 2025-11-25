import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { produtoService, type Produto } from '@/services/produtoService';
import { categoriaService, type Categoria } from '@/services/categoriaService';
import { IconPlus, IconEdit, IconTrash, IconFilter, IconX } from '@tabler/icons-react';

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    codigoBarrasFabricante: '',
    categoriaId: '',
  });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<{ nome: string; categoriaId: string }>({ nome: '', categoriaId: '' });
  const [activeFilters, setActiveFilters] = useState<{ nome: string; categoriaId: string }>({ nome: '', categoriaId: '' });

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.nome) params.append('nome', activeFilters.nome);
      if (activeFilters.categoriaId) params.append('categoriaId', activeFilters.categoriaId);

      const [produtosData, categoriasData] = await Promise.all([
        produtoService.getAll(params.toString() ? `?${params.toString()}` : ''),
        categoriaService.getAll(),
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, [activeFilters]);

  const handleOpenDialog = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        codigoBarrasFabricante: produto.codigoBarrasFabricante || '',
        categoriaId: produto.categoriaId.toString(),
      });
    } else {
      setEditingProduto(null);
      setFormData({
        nome: '',
        descricao: '',
        codigoBarrasFabricante: '',
        categoriaId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      codigoBarrasFabricante: '',
      categoriaId: '',
    });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.categoriaId) {
      toast.error('Categoria é obrigatória');
      return;
    }

    try {
      setSaving(true);
      const dataToSend = {
        nome: formData.nome,
        descricao: formData.descricao || undefined,
        codigoBarrasFabricante: formData.codigoBarrasFabricante || undefined,
        categoriaId: parseInt(formData.categoriaId),
      };

      if (editingProduto) {
        await produtoService.update(editingProduto.id, dataToSend);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await produtoService.create(dataToSend);
        toast.success('Produto criado com sucesso!');
      }
      await loadProdutos();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSaving(true);
      await produtoService.delete(deletingId);
      toast.success('Produto deletado com sucesso!');
      await loadProdutos();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast.error('Erro ao deletar produto');
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Produtos</h1>
                <p className="text-muted-foreground">Gerencie os produtos do sistema</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.nome || activeFilters.categoriaId) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {[activeFilters.nome, activeFilters.categoriaId].filter(Boolean).length}
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        <TableCell colSpan={5} className="text-center">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>{produto.categoriaNome}</TableCell>
                          <TableCell>{produto.codigoBarrasFabricante || '-'}</TableCell>
                          <TableCell>{produto.descricao || '-'}</TableCell>
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
                                onClick={() => handleOpenDeleteDialog(produto.id)}
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
            )}
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigoBarras">Código de Barras do Fabricante</Label>
              <Input
                id="codigoBarras"
                value={formData.codigoBarrasFabricante}
                onChange={(e) =>
                  setFormData({ ...formData, codigoBarrasFabricante: e.target.value })
                }
                placeholder="Ex: 7891234567890"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
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
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Produtos</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar sua busca
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-nome">Nome</Label>
              <Input
                id="filter-nome"
                value={filters.nome}
                onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
                placeholder="Digite o nome do produto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-categoria">Categoria</Label>
              <Select value={filters.categoriaId} onValueChange={(value) => setFilters({ ...filters, categoriaId: value === 'TODOS' ? '' : value })}>
                <SelectTrigger id="filter-categoria">
                  <SelectValue placeholder="Selecione a categoria" />
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
                setFilters({ nome: '', categoriaId: '' });
                setActiveFilters({ nome: '', categoriaId: '' });
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
