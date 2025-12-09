import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { tokenManager } from "@/shared/api/tokenManager";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

async function refreshTokenFn(): Promise<RefreshTokenResponse> {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/refresh`,
    {},
    {
      withCredentials: true, // Envia cookies automaticamente
    }
  );
  
  const { accessToken } = response.data;
  tokenManager.setToken(accessToken);
  
  return response.data;
}

export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: refreshTokenFn,
  });
}

