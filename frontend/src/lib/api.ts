export function getToken(): string | null {
  const stored = localStorage.getItem("auth");
  if (!stored) return null;
  try {
    return JSON.parse(stored).token ?? null;
  } catch {
    return null;
  }
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers as HeadersInit);
  if (token) headers.set("X-Auth-Token", token);
  return fetch(url, { ...options, headers });
}
