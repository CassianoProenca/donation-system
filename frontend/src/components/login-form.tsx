/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/loginSchema";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.senha);
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Erro ao fazer login. Verifique suas credenciais.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-2 shadow-2xl p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <svg
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Bem-vindo de volta
                </h1>
                <p className="text-muted-foreground text-balance">
                  Acesse o Sistema de Gestão de Doações
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("senha")}
                  disabled={isSubmitting}
                />
                <FieldError errors={errors.senha ? [errors.senha] : undefined} />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Não tem uma conta?{" "}
                <a href="/signup" className="underline">
                  Criar conta
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-linear-to-br from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-900 relative hidden md:flex items-center justify-center p-8">
            <img
              src="/imagem-login-form.png"
              alt="Ilustração de doações e voluntariado"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Sistema desenvolvido para organizações não governamentais
      </p>
    </div>
  );
}
