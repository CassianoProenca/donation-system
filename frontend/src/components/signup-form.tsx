/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
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
import { signupSchema, type SignupFormData } from "@/features/auth/schemas/signupSchema";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerUser(data.nome, data.email, data.senha, "VOLUNTARIO");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Erro ao criar conta. Tente novamente.";
      toast.error(errorMsg);
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
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Junte-se a nós
                </h1>
                <p className="text-muted-foreground text-balance">
                  Crie sua conta e comece a fazer a diferença
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  {...register("nome")}
                  disabled={isSubmitting}
                />
                <FieldError errors={errors.nome ? [errors.nome] : undefined} />
              </Field>
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
                <div className="grid grid-cols-2 gap-4">
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
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar Senha
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      {...register("confirmSenha")}
                      disabled={isSubmitting}
                    />
                    <FieldError errors={errors.confirmSenha ? [errors.confirmSenha] : undefined} />
                  </Field>
                </div>
                <FieldDescription>Mínimo de 6 caracteres</FieldDescription>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Já tem uma conta?{" "}
                <Link to="/login" className="underline">
                  Entrar
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-linear-to-br from-blue-500 to-cyan-600 dark:from-blue-700 dark:to-cyan-900 relative hidden md:flex items-center justify-center p-8">
            <img
              src="/imagem-login-form.png"
              alt="Ilustração de cadastro e comunidade"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Ao criar uma conta, você concorda com nossos termos de uso
      </p>
    </div>
  );
}
