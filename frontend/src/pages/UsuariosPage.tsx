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
import { Badge } from '@/components/ui/badge';
import { usuarioService, type Usuario } from '@/services/usuarioService';
import { IconPlus, IconEdit, IconTrash, IconFilter, IconX } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function UsuariosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ nome: string; email: string; perfil: string }>({ nome: '', email: '', perfil: '' });
  const [activeFilters, setActiveFilters] = useState<{ nome: string; email: string; perfil: string }>({ nome: '', email: '', perfil: '' });
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    perfil: '',
  });
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.perfil !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilters.nome) params.append('nome', activeFilters.nome);
      if (activeFilters.email) params.append('email', activeFilters.email);
      if (activeFilters.perfil) params.append('perfil', activeFilters.perfil);

      const data = await usuarioService.getAll(params.toString() ? `?${params.toString()}` : '');
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [activeFilters]);

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        confirmSenha: '',
        perfil: usuario.perfil,
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmSenha: '',
        perfil: 'VOLUNTARIO',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUsuario(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmSenha: '',
      perfil: '',
    });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!formData.perfil) {
      toast.error('Perfil é obrigatório');
      return;
    }

    // Validação de senha apenas para novos usuários ou quando senha for fornecida
    if (!editingUsuario) {
      if (!formData.senha || formData.senha.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (formData.senha !== formData.confirmSenha) {
        toast.error('As senhas não coincidem');
        return;
      }
    } else if (formData.senha) {
      if (formData.senha.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (formData.senha !== formData.confirmSenha) {
        toast.error('As senhas não coincidem');
        return;
      }
    }

    try {
      setSaving(true);
      const dataToSend: any = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
      };

      // Inclui senha apenas se foi fornecida
      if (formData.senha) {
        dataToSend.senha = formData.senha;
      }

      if (editingUsuario) {
        await usuarioService.update(editingUsuario.id, dataToSend);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await usuarioService.create(dataToSend);
        toast.success('Usuário criado com sucesso!');
      }
      await loadUsuarios();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    // Impede que o usuário delete a si mesmo
    if (deletingId === user?.id) {
      toast.error('Você não pode deletar sua própria conta');
      return;
    }

    try {
      setSaving(true);
      await usuarioService.delete(deletingId);
      toast.success('Usuário deletado com sucesso!');
      await loadUsuarios();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (user?.perfil !== 'ADMIN') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Usuários</h1>
                <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant='outline'
                  onClick={() => setFilterDialogOpen(true)}>
                  <IconFilter className="mr-2 h-4 w-4" />
                  Filtrar
                  {(activeFilters.nome || activeFilters.email || activeFilters.perfil) && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {[activeFilters.nome, activeFilters.email, activeFilters.perfil].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
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
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.perfil === 'ADMIN' ? 'default' : 'secondary'}>
                              {usuario.perfil}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDialog(usuario)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDeleteDialog(usuario.id)}
                                disabled={usuario.id === user?.id}
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
              {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>Preencha os dados do usuário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="perfil">Perfil *</Label>
              <Select
                value={formData.perfil}
                onValueChange={(value) => setFormData({ ...formData, perfil: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">
                Senha {editingUsuario ? '(deixe em branco para não alterar)' : '*'}
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {formData.senha && (
              <div className="grid gap-2">
                <Label htmlFor="confirmSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmSenha"
                  type="password"
                  value={formData.confirmSenha}
                  onChange={(e) => setFormData({ ...formData, confirmSenha: e.target.value })}
                  placeholder="Digite a senha novamente"
                />
              </div>
            )}
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
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
            <DialogTitle>Filtrar Usuários</DialogTitle>
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
                placeholder="Digite o nome do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-email">Email</Label>
              <Input
                id="filter-email"
                type="email"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                placeholder="Digite o email do usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-perfil">Perfil</Label>
              <Select value={filters.perfil} onValueChange={(value) => setFilters({ ...filters, perfil: value === 'TODOS' ? '' : value })}>
                <SelectTrigger id="filter-perfil">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ nome: '', email: '', perfil: '' });
                setActiveFilters({ nome: '', email: '', perfil: '' });
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
