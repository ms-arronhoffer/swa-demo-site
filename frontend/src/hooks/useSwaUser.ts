import { useEffect, useState } from "react";

interface SwaClientPrincipal {
  userId: string;
  userRoles: string[];
  identityProvider: string;
  userDetails: string;
}

export function useSwaUser() {
  const [user, setUser] = useState<SwaClientPrincipal | null>(null);

  useEffect(() => {
    fetch("/.auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.clientPrincipal ?? null))
      .catch(() => {});
  }, []);

  return user;
}
