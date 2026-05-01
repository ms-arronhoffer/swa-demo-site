import { useEffect, useState } from "react";
import type { UserInfo } from "../types";

interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

function readAuth(): AuthState {
  const stored = localStorage.getItem("auth");
  if (!stored) return { user: null, isLoading: false, isAdmin: false, isAuthenticated: false };
  try {
    const { token, isAdmin } = JSON.parse(stored);
    if (!token) throw new Error();
    return {
      user: { name: isAdmin ? "Admin" : "User", id: null, roles: isAdmin ? ["admin", "authenticated"] : ["authenticated"] },
      isLoading: false,
      isAdmin,
      isAuthenticated: true,
    };
  } catch {
    localStorage.removeItem("auth");
    return { user: null, isLoading: false, isAdmin: false, isAuthenticated: false };
  }
}

export function setAuth(token: string, isAdmin: boolean) {
  localStorage.setItem("auth", JSON.stringify({ token, isAdmin }));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuth() {
  localStorage.removeItem("auth");
  window.dispatchEvent(new Event("auth-changed"));
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true, isAdmin: false, isAuthenticated: false });

  useEffect(() => {
    setState(readAuth());
    const handler = () => setState(readAuth());
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  return state;
}
