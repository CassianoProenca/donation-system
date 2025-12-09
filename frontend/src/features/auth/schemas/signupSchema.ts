import { z } from "zod";

export const signupSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Email inválido"),
    senha: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(50, "Senha deve ter no máximo 50 caracteres"),
    confirmSenha: z
      .string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: "As senhas não coincidem",
    path: ["confirmSenha"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

