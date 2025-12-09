import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { tokenManager } from "@/shared/api/tokenManager";

async function logoutFn(): Promise<void> {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  } finally {
    tokenManager.clearToken();
  }
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logoutFn,
  });
}

