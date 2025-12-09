import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock do axios ANTES de importar o client
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    post: vi.fn(),
  },
}));

// Mock do tokenManager
const mockTokenManager = {
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
  hasToken: vi.fn(),
};

vi.mock("./tokenManager", () => ({
  tokenManager: mockTokenManager,
}));

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenManager.getToken.mockReturnValue(null);
  });

  it("deve criar instância do axios com interceptors", async () => {
    // Importa o módulo após o mock estar configurado
    await import("./client");

    expect(axios.create).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it("deve adicionar token ao header quando disponível", async () => {
    // Limpa o cache do módulo para garantir que será reimportado
    vi.resetModules();
    
    mockTokenManager.getToken.mockReturnValue("test-token");

    // Captura a função do interceptor
    let requestInterceptor: ((config: any) => any) | null = null;
    mockAxiosInstance.interceptors.request.use.mockImplementation((fn: any) => {
      requestInterceptor = fn;
      return 0; // Retorna um ID de interceptor
    });

    // Reimporta o módulo para capturar o interceptor
    await import("./client");

    // Simula uma requisição
    const config = { headers: {} };
    if (requestInterceptor) {
      const result = requestInterceptor(config);
      expect(result).toBeDefined();
    }

    expect(mockTokenManager.getToken).toHaveBeenCalled();
    expect(config.headers?.Authorization).toBe("Bearer test-token");
  });
});

