const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://dummyjson.com";

type AuthedApiOptions = {
  token?: string | null;
  signal?: AbortSignal;
  onUnauthorized?: () => void;
};

export async function authedApi<T>(
  path: string,
  init?: RequestInit,
  options?: AuthedApiOptions,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");

  const token = options?.token ?? null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, signal: options?.signal });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;

    // parse JSON error body if possible
    try {
      const json = (await res.clone().json()) as any;
      msg = json?.message ?? json?.error ?? msg;
    } catch {
      try {
        const text = await res.text();
        if (text) msg = text;
      } catch {
        /* ignore */
      }
    }

    if (res.status === 401) options?.onUnauthorized?.();
    throw new Error(msg);
  }

  return (await res.json()) as T;
}
