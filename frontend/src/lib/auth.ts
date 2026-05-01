const AUTH_KEY = "demo_portal_auth";

export function isAuthenticated(passwordHash: string): boolean {
  return sessionStorage.getItem(AUTH_KEY) === passwordHash;
}

export function setAuthenticated(passwordHash: string): void {
  sessionStorage.setItem(AUTH_KEY, passwordHash);
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
