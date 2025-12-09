import { describe, it, expect, beforeEach } from "vitest";
import { tokenManager } from "./tokenManager";

describe("tokenManager", () => {
  beforeEach(() => {
    tokenManager.clearToken();
  });

  it("deve inicializar sem token", () => {
    expect(tokenManager.getToken()).toBeNull();
    expect(tokenManager.hasToken()).toBe(false);
  });

  it("deve definir e recuperar token", () => {
    const token = "test-token-123";
    tokenManager.setToken(token);

    expect(tokenManager.getToken()).toBe(token);
    expect(tokenManager.hasToken()).toBe(true);
  });

  it("deve limpar token", () => {
    tokenManager.setToken("test-token");
    tokenManager.clearToken();

    expect(tokenManager.getToken()).toBeNull();
    expect(tokenManager.hasToken()).toBe(false);
  });

  it("deve substituir token existente", () => {
    tokenManager.setToken("old-token");
    tokenManager.setToken("new-token");

    expect(tokenManager.getToken()).toBe("new-token");
  });

  it("deve aceitar null para limpar token", () => {
    tokenManager.setToken("test-token");
    tokenManager.setToken(null);

    expect(tokenManager.getToken()).toBeNull();
    expect(tokenManager.hasToken()).toBe(false);
  });
});

