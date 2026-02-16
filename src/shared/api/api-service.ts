import { sessionStore } from "@/entities/session/model/session-store";

const BASE_URL = "https://dummyjson.com";

export async function apiService<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (sessionStore.accessToken) {
    headers.set("Authorization", `Bearer ${sessionStore.accessToken}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
