/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usuarioService, type Usuario } from "@/services/usuarioService";
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

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    nome: string;
    email: string;
    perfil: string;
  }>({ nome: "", email: "", perfil: "" });
  const [activeFilters, setActiveFilters] = useState(filters);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "VOLUNTARIO",
  });
  const [saving, setSaving] = useState(false);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("nome", searchTerm);
      } else {
        if (activeFilters.nome) params.append("nome", activeFilters.nome);
        if (activeFilters.email) params.append("email", activeFilters.email);
        if (activeFilters.perfil && activeFilters.perfil !== "TODOS")
          params.append("perfil", activeFilters.perfil);
      }

      const data = await usuarioService.getAll(
        params.toString() ? `?${params.toString()}` : "",
        page
      );

      setUsuarios(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [activeFilters, page]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(0);
      loadUsuarios();
    }
  };

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: "",
        perfil: usuario.perfil,
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        perfil: "VOLUNTARIO",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUsuario(null);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.perfil) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (!editingUsuario && !formData.senha) {
      toast.error("Senha é obrigatória para novos usuários");
      return;
    }

    try {
      setSaving(true);
      const dataToSend: any = {
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil,
      };

      if (formData.senha) {
        dataToSend.senha = formData.senha;
      }

      if (editingUsuario) {
        await usuarioService.update(editingUsuario.id, dataToSend);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await usuarioService.create(dataToSend);
        toast.success("Usuário criado com sucesso!");
      }
      await loadUsuarios();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      await usuarioService.delete(deletingId);
      toast.success("Usuário deletado com sucesso!");
      await loadUsuarios();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      toast.error("Erro ao deletar usuário");
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
                <h1 className="text-3xl font-bold">Usuários</h1>
                <p className="text-muted-foreground">
                  Gerencie o acesso ao sistema
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative w-full max-w-sm">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar usuário..."
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
              <>
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
                          <TableCell
                            colSpan={4}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Nenhum usuário encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        usuarios.map((usuario) => (
                          <TableRow key={usuario.id}>
                            <TableCell className="font-medium">
                              {usuario.nome}
                            </TableCell>
                            <TableCell>{usuario.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  usuario.perfil === "ADMIN"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {usuario.perfil}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(usuario)}
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenDeleteDialog(usuario.id)
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

                {usuarios.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Total de <strong>{totalElements}</strong> usuários. Página{" "}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>Preencha os dados de acesso</DialogDescription>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">
                Senha {editingUsuario && "(Deixe em branco para manter)"}
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) =>
                  setFormData({ ...formData, senha: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="perfil">Perfil *</Label>
              <Select
                value={formData.perfil}
                onValueChange={(value) =>
                  setFormData({ ...formData, perfil: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
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

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Usuários</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                value={filters.nome}
                onChange={(e) =>
                  setFilters({ ...filters, nome: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={filters.email}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select
                value={filters.perfil}
                onValueChange={(v) => setFilters({ ...filters, perfil: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
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
                setFilters({ nome: "", email: "", perfil: "" });
                setActiveFilters({ nome: "", email: "", perfil: "" });
                setFilterDialogOpen(false);
              }}
            >
              Limpar
            </Button>
            <Button
              onClick={() => {
                setActiveFilters(filters);
                setPage(0);
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
