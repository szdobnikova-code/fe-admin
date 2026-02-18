import type { ProductsResponse } from "../model/types";
import { authed } from "@/entities/session/api/authed";

export function getProducts(params: {
  q?: string;
  take: number;
  skip: number;
  sortBy?: string;
  order?: "asc" | "desc";
  signal?: AbortSignal;
}) {
  const { q, take, skip, sortBy, order, signal } = params;

  const sp = new URLSearchParams();
  sp.set("limit", String(take));
  sp.set("skip", String(skip));
  if (sortBy) sp.set("sortBy", sortBy);
  if (order) sp.set("order", order);

  const path = q
    ? `/products/search?q=${encodeURIComponent(q)}&${sp.toString()}`
    : `/products?${sp.toString()}`;

  return authed<ProductsResponse>(path, undefined, signal);
}
