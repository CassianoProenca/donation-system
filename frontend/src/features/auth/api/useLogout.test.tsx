import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLogoutMutation } from "./useLogout";
import axios from "axios";

vi.mock("axios");
vi.mock("@/shared/api/tokenManager", () => ({
  tokenManager: {
    clearToken: vi.fn(),
  },
}));

describe("useLogoutMutation", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    
    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    mockTokenManager.clearToken.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("deve fazer logout com sucesso", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useLogoutMutation(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/logout"),
      {},
      { withCredentials: true }
    );

    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    expect(mockTokenManager.clearToken).toHaveBeenCalled();
  });

  it("deve limpar token mesmo se logout falhar", async () => {
    const error = new Error("Logout failed");
    vi.mocked(axios.post).mockRejectedValue(error);

    const { result } = renderHook(() => useLogoutMutation(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const tokenManagerModule = await import("@/shared/api/tokenManager");
    const mockTokenManager = tokenManagerModule.tokenManager as any;
    expect(mockTokenManager.clearToken).toHaveBeenCalled();
  });
});

