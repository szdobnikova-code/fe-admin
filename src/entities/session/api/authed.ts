import { authedApi } from "@/shared/api/authed-api";
import { sessionStore } from "@/entities/session/model/session-store";

export function authed<T>(path: string, init?: RequestInit, signal?: AbortSignal) {
  return authedApi<T>(path, init, {
    token: sessionStore.accessToken,
    signal,
    onUnauthorized: () => {
      sessionStore.logout();
      window.location.href = "/login";
    },
  });
}
