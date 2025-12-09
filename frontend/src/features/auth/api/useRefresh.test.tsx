import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRefreshTokenMutation } from "./useRefresh";
import { tokenManager } from "@/shared/api/tokenManager";
import axios from "axios";

vi.mock("axios");
vi.mock("@/shared/api/tokenManager", () => ({
  tokenManager: {
    setToken: vi.fn(),
  },
}));

describe("useRefreshTokenMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("deve fazer refresh do token com sucesso", async () => {
    const mockResponse = {
      data: {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRefreshTokenMutation(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/refresh"),
      {},
      { withCredentials: true }
    );

    expect(tokenManager.setToken).toHaveBeenCalledWith("new-access-token");
    expect(result.current.data).toEqual(mockResponse.data);
  });

  it("deve tratar erro ao fazer refresh", async () => {
    const error = new Error("Refresh failed");
    vi.mocked(axios.post).mockRejectedValue(error);

    const { result } = renderHook(() => useRefreshTokenMutation(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

