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
import { loteService, type Lote, type UnidadeMedida } from '@/services/loteService';
import { produtoService, type Produto } from '@/services/produtoService';
import { IconPlus, IconEdit, IconTrash, IconFilter, IconX } from '@tabler/icons-react';

export function LotesPage() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ produtoId: string; dataEntradaInicio: string; dataEntradaFim: string; comEstoque: string }>({ produtoId: '', dataEntradaInicio: '', dataEntradaFim: '', comEstoque: '' });
  const [activeFilters, setActiveFilters] = useState<{ produtoId: string; dataEntradaInicio: string; dataEntradaFim: string; comEstoque: string }>({ produtoId: '', dataEntradaInicio: '', dataEntradaFim: '', comEstoque: '' });
  const [formData, setFormData] = useState({
    produtoId: '',
    quantidadeInicial: '',
    quantidadeAtual: '',
    dataEntrada: '',
    unidadeMedida: '' as UnidadeMedida | '',
    dataValidade: '',
    tamanho: '',
    voltagem: '',
    observacoes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.produtoId) params.append('produtoId', activeFilters.produtoId);
      if (activeFilters.dataEntradaInicio) params.append('dataEntradaInicio', activeFilters.dataEntradaInicio);
      if (activeFilters.dataEntradaFim) params.append('dataEntradaFim', activeFilters.dataEntradaFim);
      if (activeFilters.comEstoque) params.append('comEstoque', activeFilters.comEstoque);

      const [lotesData, produtosData] = await Promise.all([
        loteService.getAll(params.toString() ? `?${params.toString()}` : ''),
        produtoService.getAll(),
      ]);
      setLotes(lotesData);
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters]);

  const handleOpenDialog = (lote?: Lote) => {
    if (lote) {
      setEditingLote(lote);
      setFormData({
        produtoId: lote.produtoId.toString(),
        quantidadeInicial: lote.quantidadeInicial.toString(),
        quantidadeAtual: lote.quantidadeAtual.toString(),
        dataEntrada: lote.dataEntrada,
        unidadeMedida: lote.unidadeMedida || '',
        dataValidade: lote.dataValidade || '',
        tamanho: lote.tamanho || '',
        voltagem: lote.voltagem || '',
        observacoes: lote.observacoes || '',
      });
    } else {
      setEditingLote(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        produtoId: '',
        quantidadeInicial: '',
        quantidadeAtual: '',
        dataEntrada: today,
        unidadeMedida: '',
        dataValidade: '',
        tamanho: '',
        voltagem: '',
        observacoes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLote(null);
  };

  const handleSave = async () => {
    if (!formData.produtoId) {
      toast.error('Produto é obrigatório');
      return;
    }
    if (!formData.quantidadeInicial || parseInt(formData.quantidadeInicial) <= 0) {
      toast.error('Quantidade inicial deve ser maior que zero');
      return;
    }
    if (!formData.dataEntrada) {
      toast.error('Data de entrada é obrigatória');
      return;
    }
    if (!formData.unidadeMedida) {
      toast.error('Unidade de medida é obrigatória');
      return;
    }

    try {
      setSaving(true);
      const dataToSend: any = {
        produtoId: parseInt(formData.produtoId),
        quantidadeInicial: parseInt(formData.quantidadeInicial),
        dataEntrada: formData.dataEntrada,
        unidadeMedida: formData.unidadeMedida,
        dataValidade: formData.dataValidade || undefined,
        tamanho: formData.tamanho || undefined,
        voltagem: formData.voltagem || undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (editingLote) {
        dataToSend.quantidadeAtual = parseInt(formData.quantidadeAtual);
        await loteService.update(editingLote.id, dataToSend);
        toast.success('Lote atualizado com sucesso!');
      } else {
        await loteService.create(dataToSend);
        toast.success('Lote criado com sucesso!');
      }
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      toast.error('Erro ao salvar lote');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSaving(true);
      await loteService.delete(deletingId);
      toast.success('Lote deletado com sucesso!');
      await loadData();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao deletar lote:', error);
      toast.error('Erro ao deletar lote');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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
                <h1 className="text-3xl font-bold">Lotes</h1>
                <p className="text-muted-foreground">Gerencie os lotes de produtos</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant='outline'
                  onClick={() => setFilterDialogOpen(true)}>
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.produtoId || activeFilters.dataEntradaInicio || activeFilters.dataEntradaFim || activeFilters.comEstoque) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {[activeFilters.produtoId, activeFilters.dataEntradaInicio, activeFilters.dataEntradaFim, activeFilters.comEstoque].filter(Boolean).length}
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
                        <TableCell colSpan={8} className="text-center">
                          Nenhum lote encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      lotes.map((lote) => (
                        <TableRow key={lote.id}>
                          <TableCell className="font-mono">{lote.codigoBarras || '-'}</TableCell>
                          <TableCell className="font-medium">{lote.produtoNome}</TableCell>
                          <TableCell>{lote.quantidadeInicial}</TableCell>
                          <TableCell>{lote.quantidadeAtual}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {lote.unidadeMedida === 'UNIDADE' && 'Un'}
                              {lote.unidadeMedida === 'QUILOGRAMA' && 'Kg'}
                              {lote.unidadeMedida === 'LITRO' && 'L'}
                              {lote.unidadeMedida === 'PACOTE' && 'Pct'}
                              {lote.unidadeMedida === 'CAIXA' && 'Cx'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(lote.dataEntrada)}</TableCell>
                          <TableCell>
                            {lote.dataValidade ? formatDate(lote.dataValidade) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDialog(lote)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDeleteDialog(lote.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLote ? 'Editar Lote' : 'Novo Lote'}</DialogTitle>
            <DialogDescription>Preencha os dados do lote</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="produto">Produto *</Label>
              <Select
                value={formData.produtoId}
                onValueChange={(value) => setFormData({ ...formData, produtoId: value })}
                disabled={!!editingLote}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum produto cadastrado
                    </div>
                  ) : (
                    produtos.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id.toString()}>
                        {prod.nome}{prod.categoriaNome ? ` (${prod.categoriaNome})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantidadeInicial">Quantidade Inicial *</Label>
                <Input
                  id="quantidadeInicial"
                  type="number"
                  value={formData.quantidadeInicial}
                  onChange={(e) =>
                    setFormData({ ...formData, quantidadeInicial: e.target.value })
                  }
                  disabled={!!editingLote}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
                <Select
                  value={formData.unidadeMedida}
                  onValueChange={(value) => setFormData({ ...formData, unidadeMedida: value as UnidadeMedida })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIDADE">Unidade</SelectItem>
                    <SelectItem value="QUILOGRAMA">Quilograma (Kg)</SelectItem>
                    <SelectItem value="LITRO">Litro (L)</SelectItem>
                    <SelectItem value="PACOTE">Pacote</SelectItem>
                    <SelectItem value="CAIXA">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingLote && (
              <div className="grid gap-2">
                <Label htmlFor="quantidadeAtual">Quantidade Atual</Label>
                <Input
                  id="quantidadeAtual"
                  type="number"
                  value={formData.quantidadeAtual}
                  onChange={(e) =>
                    setFormData({ ...formData, quantidadeAtual: e.target.value })
                  }
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataEntrada">Data de Entrada *</Label>
                <Input
                  id="dataEntrada"
                  type="date"
                  value={formData.dataEntrada}
                  onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataValidade">Data de Validade</Label>
                <Input
                  id="dataValidade"
                  type="date"
                  value={formData.dataValidade}
                  onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tamanho">Tamanho</Label>
                <Input
                  id="tamanho"
                  value={formData.tamanho}
                  onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                  placeholder="Ex: M, G, GG"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voltagem">Voltagem</Label>
                <Input
                  id="voltagem"
                  value={formData.voltagem}
                  onChange={(e) => setFormData({ ...formData, voltagem: e.target.value })}
                  placeholder="Ex: 110V, 220V"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais"
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
              Tem certeza que deseja excluir este lote? Esta ação não pode ser desfeita.
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
            <DialogTitle>Filtrar Lotes</DialogTitle>
            <DialogDescription>
              Aplique filtros para refinar sua busca
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filter-produto">Produto</Label>
              <Select value={filters.produtoId} onValueChange={(value) => setFilters({ ...filters, produtoId: value === 'TODOS' ? '' : value })}>
                <SelectTrigger id="filter-produto">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {produtos.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>
                      {prod.nome}{prod.categoriaNome ? ` (${prod.categoriaNome})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataEntradaInicio">Data Entrada Início</Label>
              <Input
                id="filter-dataEntradaInicio"
                type="date"
                value={filters.dataEntradaInicio}
                onChange={(e) => setFilters({ ...filters, dataEntradaInicio: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataEntradaFim">Data Entrada Fim</Label>
              <Input
                id="filter-dataEntradaFim"
                type="date"
                value={filters.dataEntradaFim}
                onChange={(e) => setFilters({ ...filters, dataEntradaFim: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-comEstoque">Estoque</Label>
              <Select value={filters.comEstoque} onValueChange={(value) => setFilters({ ...filters, comEstoque: value === 'TODOS' ? '' : value })}>
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
                setFilters({ produtoId: '', dataEntradaInicio: '', dataEntradaFim: '', comEstoque: '' });
                setActiveFilters({ produtoId: '', dataEntradaInicio: '', dataEntradaFim: '', comEstoque: '' });
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
