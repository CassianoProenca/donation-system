import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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
import { Badge } from '@/components/ui/badge';
import { movimentacaoService, type Movimentacao } from '@/services/movimentacaoService';
import { loteService, type Lote } from '@/services/loteService';
import { usuarioService, type Usuario } from '@/services/usuarioService';
import { IconPlus, IconFilter, IconX } from '@tabler/icons-react';

const tipoLabels: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  AJUSTE_PERDA: 'Ajuste (Perda)',
  AJUSTE_GANHO: 'Ajuste (Ganho)',
};

const tipoColors: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  ENTRADA: 'default',
  SAIDA: 'destructive',
  AJUSTE_PERDA: 'outline',
  AJUSTE_GANHO: 'secondary',
};

export function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    loteId: '',
    tipo: '',
    quantidade: '',
  });
  const [filters, setFilters] = useState<{ tipo: string; loteId: string; usuarioId: string; dataInicio: string; dataFim: string }>({
    tipo: '',
    loteId: '',
    usuarioId: '',
    dataInicio: '',
    dataFim: '',
  });
  const [activeFilters, setActiveFilters] = useState<{ tipo: string; loteId: string; usuarioId: string; dataInicio: string; dataFim: string }>({
    tipo: '',
    loteId: '',
    usuarioId: '',
    dataInicio: '',
    dataFim: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.tipo) params.append('tipo', activeFilters.tipo);
      if (activeFilters.loteId) params.append('loteId', activeFilters.loteId);
      if (activeFilters.usuarioId) params.append('usuarioId', activeFilters.usuarioId);
      if (activeFilters.dataInicio) params.append('dataInicio', activeFilters.dataInicio);
      if (activeFilters.dataFim) params.append('dataFim', activeFilters.dataFim);

      const [movimentacoesData, lotesData, usuariosData] = await Promise.all([
        movimentacaoService.getAll(params.toString() ? `?${params.toString()}` : ''),
        loteService.getAll(),
        usuarioService.getAll(),
      ]);
      setMovimentacoes(movimentacoesData);
      setLotes(lotesData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters]);

  const handleOpenDialog = () => {
    setFormData({
      loteId: '',
      tipo: '',
      quantidade: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const { user } = useAuth();

  const handleSave = async () => {
    if (!formData.loteId) {
      toast.error('Lote é obrigatório');
      return;
    }
    if (!formData.tipo) {
      toast.error('Tipo é obrigatório');
      return;
    }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
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
      toast.success('Movimentação registrada com sucesso!');
      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
      toast.error('Erro ao salvar movimentação');
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
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
                <h1 className="text-3xl font-bold">Movimentações</h1>
                <p className="text-muted-foreground">
                  Registre e visualize as movimentações de estoque
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant='outline'
                  onClick={() => setFilterDialogOpen(true)}>
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.tipo || activeFilters.loteId || activeFilters.usuarioId || activeFilters.dataInicio || activeFilters.dataFim) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {[activeFilters.tipo, activeFilters.loteId, activeFilters.usuarioId, activeFilters.dataInicio, activeFilters.dataFim].filter(Boolean).length}
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
                        <TableCell colSpan={6} className="text-center">
                          Nenhuma movimentação encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimentacoes.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell>{formatDateTime(mov.dataHora)}</TableCell>
                          <TableCell className="font-mono">#{mov.lote?.id || mov.loteId}</TableCell>
                          <TableCell className="font-medium">{mov.lote?.produtoNome || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={tipoColors[mov.tipo]}>
                              {tipoLabels[mov.tipo]}
                            </Badge>
                          </TableCell>
                          <TableCell>{mov.quantidade}</TableCell>
                          <TableCell>{mov.usuario?.nome || 'Sistema'}</TableCell>
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
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>Registre uma movimentação de estoque</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lote">Lote *</Label>
              <Select
                value={formData.loteId}
                onValueChange={(value) => setFormData({ ...formData, loteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lote" />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id} value={lote.id.toString()}>
                      {lote.produtoNome} - {lote.codigoBarras} (Atual: {lote.quantidadeAtual})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
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
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
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
              <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value === 'TODOS' ? '' : value })}>
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
              <Select value={filters.loteId} onValueChange={(value) => setFilters({ ...filters, loteId: value === 'TODOS' ? '' : value })}>
                <SelectTrigger id="filter-lote">
                  <SelectValue placeholder="Selecione o lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id} value={lote.id.toString()}>
                      {lote.produtoNome} - {lote.codigoBarras}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-usuario">Usuário</Label>
              <Select value={filters.usuarioId} onValueChange={(value) => setFilters({ ...filters, usuarioId: value === 'TODOS' ? '' : value })}>
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
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-dataFim">Data Fim</Label>
              <Input
                id="filter-dataFim"
                type="datetime-local"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ tipo: '', loteId: '', usuarioId: '', dataInicio: '', dataFim: '' });
                setActiveFilters({ tipo: '', loteId: '', usuarioId: '', dataInicio: '', dataFim: '' });
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
