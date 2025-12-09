import { describe, it, expect } from "vitest";
import { loginSchema } from "./loginSchema";

describe("loginSchema", () => {
  it("deve validar dados corretos", () => {
    const validData = {
      email: "test@example.com",
      senha: "password123",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar email inválido", () => {
    const invalidData = {
      email: "invalid-email",
      senha: "password123",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("deve rejeitar senha muito curta", () => {
    const invalidData = {
      email: "test@example.com",
      senha: "12345", // Menos de 6 caracteres
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("senha");
    }
  });

  it("deve rejeitar campos vazios", () => {
    const invalidData = {
      email: "",
      senha: "",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

