/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService } from '@/services/usuarioService';
import { IconUserCircle, IconMail, IconShieldCheck } from '@tabler/icons-react';

export function PerfilPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);

      const dataToUpdate: any = {
        nome: formData.nome,
        email: formData.email,
      };

      if (formData.novaSenha) {
        if (formData.novaSenha.length < 6) {
          toast.error('A nova senha deve ter pelo menos 6 caracteres');
          return;
        }
        if (formData.novaSenha !== formData.confirmarSenha) {
          toast.error('As senhas não coincidem');
          return;
        }
        dataToUpdate.senha = formData.novaSenha;
      }

      await usuarioService.update(user.id, dataToUpdate);

      toast.success('Perfil atualizado com sucesso!');

      setFormData({
        ...formData,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <IconUserCircle className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{user.nome}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <IconMail className="h-4 w-4" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <IconShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Perfil:</span>
                    <Badge variant={user.perfil === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.perfil}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editar Informações</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e senha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu.email@exemplo.com"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="mb-4 text-sm font-medium">Alterar Senha (opcional)</h3>
                        <p className="mb-4 text-xs text-muted-foreground">
                          Deixe em branco se não deseja alterar a senha
                        </p>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="novaSenha">Nova Senha</Label>
                            <Input
                              id="novaSenha"
                              type="password"
                              value={formData.novaSenha}
                              onChange={(e) =>
                                setFormData({ ...formData, novaSenha: e.target.value })
                              }
                              placeholder="Digite a nova senha (mínimo 6 caracteres)"
                            />
                          </div>

                          {formData.novaSenha && (
                            <div className="grid gap-2">
                              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                              <Input
                                id="confirmarSenha"
                                type="password"
                                value={formData.confirmarSenha}
                                onChange={(e) =>
                                  setFormData({ ...formData, confirmarSenha: e.target.value })
                                }
                                placeholder="Digite a senha novamente"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" type="submit" disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID do Usuário:</span>
                    <span className="font-mono">#{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de Conta:</span>
                    <span>{user.perfil === 'ADMIN' ? 'Administrador' : 'Voluntário'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permissões:</span>
                    <span>
                      {user.perfil === 'ADMIN'
                        ? 'Acesso total ao sistema'
                        : 'Gestão de estoque e doações'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
