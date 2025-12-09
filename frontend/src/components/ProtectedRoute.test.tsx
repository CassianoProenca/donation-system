import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Mock do useAuth
const mockUseAuth = vi.fn();
vi.mock("@/features/auth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar children quando autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 1, nome: "Test", email: "test@test.com", perfil: "ADMIN" },
      token: "test-token",
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("deve exibir loading quando está carregando", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      token: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });
});

