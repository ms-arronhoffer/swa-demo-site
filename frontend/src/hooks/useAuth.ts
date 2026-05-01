import { useEffect, useState } from "react";
import type { UserInfo } from "../types";

interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((user: UserInfo) => {
        setState({
          user,
          isLoading: false,
          isAdmin: user.roles.includes("admin"),
        });
      })
      .catch(() => {
        setState({ user: null, isLoading: false, isAdmin: false });
      });
  }, []);

  return state;
}
