const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://dummyjson.com";

export type ApiServiceOptions = {
  token?: string;
  onUnauthorized?: () => void;
};

export async function apiService<T>(
  path: string,
  init?: RequestInit,
  options?: ApiServiceOptions,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    // ✅ 401 handler
    if (res.status === 401) {
      options?.onUnauthorized?.();
    }

    // ✅ parse error body properly (json -> message)
    let errorMessage = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      errorMessage =
        json && (json.message || json.error) ? json.message || json.error : errorMessage;
    } catch {
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch {
        // ignore
      }
    }

    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}
