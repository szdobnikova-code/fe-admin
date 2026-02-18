import { stores } from "@/app/providers/stores-context";

type RequestOptions = RequestInit & {
  // якщо треба буде потім вимикати глобальний спінер для окремих запитів
  withGlobalLoading?: boolean;
};

export async function request<T>(input: RequestInfo | URL, init?: RequestOptions): Promise<T> {
  const withGlobalLoading = init?.withGlobalLoading !== false;

  if (withGlobalLoading) stores.uiStore.startLoading();

  try {
    const res = await fetch(input, init);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
  } finally {
    if (withGlobalLoading) stores.uiStore.stopLoading();
  }
}
