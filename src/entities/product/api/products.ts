import { apiService } from "@/shared/api/api-service";
import type { ProductsResponse, Product } from "../model/types";

export function getProducts(params: {
  q?: string;
  take: number;
  skip: number;
  sortBy?: string;
  order?: "asc" | "desc";
}) {
  const { q, take, skip, sortBy, order } = params;

  const sp = new URLSearchParams();
  sp.set("limit", String(take));
  sp.set("skip", String(skip));
  if (sortBy) sp.set("sortBy", sortBy);
  if (order) sp.set("order", order);

  const path = q
    ? `/products/search?q=${encodeURIComponent(q)}&${sp.toString()}`
    : `/products?${sp.toString()}`;

  return apiService<ProductsResponse>(path);
}

export function createProduct(payload: Partial<Product>) {
  return apiService<Product>("/products/add", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(id: number, payload: Partial<Product>) {
  return apiService<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteProduct(id: number) {
  return apiService<{ id: number }>(`/products/${id}`, { method: "DELETE" });
}
