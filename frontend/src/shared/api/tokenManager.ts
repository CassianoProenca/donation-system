/**
 * Gerenciador de Access Token em memória
 * O refresh token é gerenciado automaticamente via cookies HttpOnly
 */
class TokenManager {
  private accessToken: string | null = null;

  setToken(token: string | null): void {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearToken(): void {
    this.accessToken = null;
  }

  hasToken(): boolean {
    return this.accessToken !== null;
  }
}

export const tokenManager = new TokenManager();

