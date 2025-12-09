import { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import type { User } from "../types";
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useRefreshTokenMutation } from "../api";
import { AuthContext } from "./authContext";
import { tokenManager } from "@/shared/api/tokenManager";

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return {
      id: decoded.userId || decoded.id,
      nome: decoded.nome,
      email: decoded.sub,
      perfil: decoded.perfil,
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const refreshMutation = useRefreshTokenMutation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await refreshMutation.mutateAsync();
        const { accessToken } = response;
        
        const decodedUser = decodeToken(accessToken);
        if (decodedUser) {
          setToken(accessToken);
          setUser(decodedUser);
          tokenManager.setToken(accessToken);
        }
      } catch (error) {
        tokenManager.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, senha });
      const { accessToken } = response;

      const decodedUser = decodeToken(accessToken);
      if (decodedUser) {
        setToken(accessToken);
        setUser(decodedUser);
        tokenManager.setToken(accessToken);
        toast.success("Login realizado com sucesso!");
      }
    } catch (error) {
      const message = (error as Error).message || "Erro ao fazer login";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    nome: string,
    email: string,
    senha: string,
    perfil: "ADMIN" | "VOLUNTARIO"
  ) => {
    try {
      await registerMutation.mutateAsync({ nome, email, senha, perfil });
      await login(email, senha);
      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      const message = (error as Error).message || "Erro ao fazer cadastro";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setToken(null);
      setUser(null);
      tokenManager.clearToken();
      toast.info("Você saiu da aplicação");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
