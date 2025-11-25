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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoriaService, type Categoria, type TipoCategoria } from '@/services/categoriaService';
import { IconPlus, IconEdit, IconTrash, IconFilter, IconX } from '@tabler/icons-react';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{ nome: string; descricao: string; tipo: TipoCategoria | '' }>({ nome: '', descricao: '', tipo: '' });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<{ nome: string; tipo: string }>({ nome: '', tipo: '' });
  const [activeFilters, setActiveFilters] = useState<{ nome: string; tipo: string }>({ nome: '', tipo: '' });

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.nome) params.append('nome', activeFilters.nome);
      if (activeFilters.tipo) params.append('tipo', activeFilters.tipo);

      const data = await categoriaService.getAll(params.toString() ? `?${params.toString()}` : '');
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, [activeFilters]);

  const handleOpenDialog = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({ nome: categoria.nome, descricao: categoria.descricao || '', tipo: categoria.tipo || '' });
    } else {
      setEditingCategoria(null);
      setFormData({ nome: '', descricao: '', tipo: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategoria(null);
    setFormData({ nome: '', descricao: '', tipo: '' });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.tipo) {
      toast.error('Tipo é obrigatório');
      return;
    }

    try {
      setSaving(true);
      const dataToSend = {
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo as TipoCategoria
      };
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, dataToSend);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.create(dataToSend);
        toast.success('Categoria criada com sucesso!');
      }
      await loadCategorias();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSaving(true);
      await categoriaService.delete(deletingId);
      toast.success('Categoria deletada com sucesso!');
      await loadCategorias();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast.error('Erro ao deletar categoria');
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
                <h1 className="text-3xl font-bold">Categorias</h1>
                <p className="text-muted-foreground">Gerencie as categorias de produtos</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant='outline'
                  onClick={() => setFilterDialogOpen(true)}>
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.nome || activeFilters.tipo) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {[activeFilters.nome, activeFilters.tipo].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleOpenDialog()}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Nova Categoria
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          Nenhuma categoria encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      categorias.map((categoria) => (
                        <TableRow key={categoria.id}>
                          <TableCell className="font-medium">{categoria.nome}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                              {categoria.tipo === 'ALIMENTO' && 'Alimento'}
                              {categoria.tipo === 'VESTUARIO' && 'Vestuário'}
                              {categoria.tipo === 'ELETRONICO' && 'Eletrônico'}
                              {categoria.tipo === 'HIGIENE' && 'Higiene'}
                              {categoria.tipo === 'OUTROS' && 'Outros'}
                            </span>
                          </TableCell>
                          <TableCell>{categoria.descricao || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(categoria)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDeleteDialog(categoria.id)}
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
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da categoria
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Alimentos"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as TipoCategoria })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALIMENTO">Alimento</SelectItem>
                  <SelectItem value="VESTUARIO">Vestuário</SelectItem>
                  <SelectItem value="ELETRONICO">Eletrônico</SelectItem>
                  <SelectItem value="HIGIENE">Higiene</SelectItem>
                  <SelectItem value="OUTROS">Outros</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSave} disabled={saving}>
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
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
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
            <DialogTitle>Filtrar Categorias</DialogTitle>
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
                placeholder="Digite o nome da categoria"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-tipo">Tipo</Label>
              <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value === 'TODOS' ? '' : value })}>
                <SelectTrigger id="filter-tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ALIMENTO">Alimento</SelectItem>
                  <SelectItem value="VESTUARIO">Vestuário</SelectItem>
                  <SelectItem value="ELETRONICO">Eletrônico</SelectItem>
                  <SelectItem value="HIGIENE">Higiene</SelectItem>
                  <SelectItem value="OUTROS">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ nome: '', tipo: '' });
                setActiveFilters({ nome: '', tipo: '' });
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
