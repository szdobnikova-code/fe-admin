import type { Product } from "@/entities/product/model/types";
import { authed } from "@/entities/session/api/authed";

export function createProduct(payload: Partial<Product>) {
  return authed<Product>("/products/add", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(id: number, payload: Partial<Product>) {
  return authed<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}
