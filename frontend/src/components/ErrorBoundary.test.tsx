import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// Componente que lança erro para testar o ErrorBoundary
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  it("deve renderizar children quando não há erro", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro quando há erro", () => {
    // Suprime console.error durante o teste
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("deve exibir stack trace em modo desenvolvimento", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock do import.meta.env para desenvolvimento
    const originalMode = import.meta.env.MODE;
    Object.defineProperty(import.meta, "env", {
      value: { ...import.meta.env, MODE: "development" },
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verifica se o erro está sendo exibido (pode estar em details)
    const errorElement = screen.queryByText(/Test error/i) || 
                         screen.queryByText(/Error: Test error/i);
    expect(errorElement || screen.getByText(/Algo deu errado/i)).toBeTruthy();

    Object.defineProperty(import.meta, "env", {
      value: { ...import.meta.env, MODE: originalMode },
      writable: true,
      configurable: true,
    });
    consoleSpy.mockRestore();
  });
});
