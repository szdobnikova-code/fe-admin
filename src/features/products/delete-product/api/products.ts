import { authed } from "@/entities/session/api/authed";

export function deleteProduct(id: number) {
  return authed<{ id: number }>(`/products/${id}`, { method: "DELETE" });
}
