import { z } from "zod";

const componenteSchema = z.object({
  produtoId: z
    .number()
    .positive("Selecione um produto"),
  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero")
    .min(1, "Quantidade mínima é 1"),
});

export const produtoSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    descricao: z
      .string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .optional(),
    codigoBarrasFabricante: z
      .string()
      .max(50, "Código de barras deve ter no máximo 50 caracteres")
      .optional(),
    categoriaId: z
      .number()
      .positive("Selecione uma categoria"),
    isKit: z.boolean().default(false),
    componentes: z.array(componenteSchema).optional(),
  })
  .refine(
    (data) => {
      // Se for kit, deve ter pelo menos um componente
      if (data.isKit) {
        return data.componentes && data.componentes.length > 0;
      }
      return true;
    },
    {
      message: "Kit deve ter pelo menos um componente",
      path: ["componentes"],
    }
  );

export type ProdutoFormData = z.infer<typeof produtoSchema>;

