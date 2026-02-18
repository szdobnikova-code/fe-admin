import { sessionStore } from "@/entities/session/model/session-store";
import { uiStore } from "@/shared/model/ui-store";

const BASE_URL = "https://dummyjson.com";

export async function apiService<T>(path: string, init?: RequestInit): Promise<T> {
  uiStore.startLoading();

  try {
    const headers = new Headers(init?.headers);

    if (!headers.has("Content-Type") && init?.body) {
      headers.set("Content-Type", "application/json");
    }

    if (sessionStore.accessToken) {
      headers.set("Authorization", `Bearer ${sessionStore.accessToken}`);
    }

    await new Promise((r) => setTimeout(r, 400));
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
  } finally {
    uiStore.stopLoading();
  }
}
