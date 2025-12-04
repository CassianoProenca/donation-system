import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: "ADMIN" | "VOLUNTARIO";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (
    nome: string,
    email: string,
    senha: string,
    perfil: "ADMIN" | "VOLUNTARIO"
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    return {
      id: decoded.id,
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

  useEffect(() => {
    localStorage.removeItem("user");

    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser) {
          setToken(storedToken);
          setUser(decodedUser);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Erro ao processar token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post("/api/auth/login", { email, senha });
    const { token: newToken } = response.data;

    const decodedUser = decodeToken(newToken);
    if (decodedUser) {
      setToken(newToken);
      setUser(decodedUser);
      localStorage.setItem("token", newToken);
    }
  };

  const register = async (
    nome: string,
    email: string,
    senha: string,
    perfil: "ADMIN" | "VOLUNTARIO"
  ) => {
    await api.post("/api/usuarios", { nome, email, senha, perfil });
    await login(email, senha);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
