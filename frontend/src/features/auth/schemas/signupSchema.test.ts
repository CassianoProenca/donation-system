import { describe, it, expect } from "vitest";
import { signupSchema } from "./signupSchema";

describe("signupSchema", () => {
  it("deve validar dados corretos", () => {
    const validData = {
      nome: "João Silva",
      email: "joao@example.com",
      senha: "password123",
      confirmSenha: "password123",
    };

    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar senhas que não coincidem", () => {
    const invalidData = {
      nome: "João Silva",
      email: "joao@example.com",
      senha: "password123",
      confirmSenha: "different123",
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmSenha");
    }
  });

  it("deve rejeitar nome muito curto", () => {
    const invalidData = {
      nome: "Jo",
      email: "joao@example.com",
      senha: "password123",
      confirmSenha: "password123",
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("nome");
    }
  });
});

