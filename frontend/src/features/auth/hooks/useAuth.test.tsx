import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./useAuth";
import { useAuth } from "./useAuthHook";
import { ReactNode } from "react";

// Mock do tokenManager - deve ser definido dentro da factory
vi.mock("@/shared/api/tokenManager", () => {
  const mockTokenManager = {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    hasToken: vi.fn(),
  };
  return {
    tokenManager: mockTokenManager,
  };
});

// Mock do toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock das mutations
vi.mock("../api", () => ({
  useLoginMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      accessToken: "mock-access-token",
      usuarioId: 1,
      nome: "Test User",
      email: "test@test.com",
      perfil: "ADMIN",
    }),
  }),
  useRegisterMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
  useLogoutMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
  useRefreshTokenMutation: () => ({
    mutateAsync: vi.fn().mockRejectedValue(new Error("No refresh token")),
  }),
}));

describe("useAuth", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    
    // Importa o mock após o vi.mock ter sido processado
    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    mockTokenManager.getToken.mockReturnValue(null);
    mockTokenManager.clearToken.mockClear();
    mockTokenManager.setToken.mockClear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  it("deve inicializar sem usuário quando não há token", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    
    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    expect(mockTokenManager.clearToken).toHaveBeenCalled();
  });

  it("deve fazer logout corretamente", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    await result.current.logout();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    
    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    expect(mockTokenManager.clearToken).toHaveBeenCalled();
  });
});

