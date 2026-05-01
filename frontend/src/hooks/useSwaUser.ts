import { useEffect, useState } from "react";

interface SwaClientPrincipal {
  userId: string;
  userRoles: string[];
  identityProvider: string;
  userDetails: string;
  claims?: { typ: string; val: string }[];
}

export interface SwaUser {
  displayName: string;
  email: string;
}

export function useSwaUser(): SwaUser | null {
  const [user, setUser] = useState<SwaUser | null>(null);

  useEffect(() => {
    fetch("/.auth/me")
      .then((r) => r.json())
      .then((data: { clientPrincipal: SwaClientPrincipal | null }) => {
        const p = data.clientPrincipal;
        if (!p) return;
        const nameClaim = p.claims?.find((c) => c.typ === "name")?.val;
        setUser({
          displayName: nameClaim ?? p.userDetails,
          email: p.userDetails,
        });
      })
      .catch(() => {});
  }, []);

  return user;
}
