import { z } from "zod";

export const categoriaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  icone: z
    .string()
    .max(10, "Ícone deve ter no máximo 10 caracteres")
    .optional(),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;

