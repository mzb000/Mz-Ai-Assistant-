"use client";

import { useAuthStore } from "@/store/auth-store";
import * as authApi from "@/lib/api/auth";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout, loadFromStorage } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAuth(res.user, res.access_token);
    return res;
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await authApi.register(email, username, password);
    setAuth(res.user, res.access_token);
    return res;
  };

  return { user, token, isAuthenticated, login, register, logout, loadFromStorage };
}
