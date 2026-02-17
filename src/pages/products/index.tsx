import { useEffect, useMemo, useReducer, useState } from "react";
import { getProducts } from "@/entities/product/api/products";
import type { Product } from "@/entities/product/model/types";
import { useQueryState } from "@/shared/lib/use-query-state";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { UpsertProductDialog } from "@/features/products/upsert-product/ui/upsert-product-dialog.tsx";

export function ProductsPage() {
  const qs = useQueryState();

  // URL state (single source of truth)
  const q = qs.get("q", "");
  const sortBy = qs.get("sortBy", "");
  const order = (qs.get("order", "asc") as "asc" | "desc") || "asc";
  const take = Number(qs.get("take", "10"));
  const skip = Number(qs.get("skip", "0"));
  const category = qs.get("category", "");
  const brand = qs.get("brand", "");
  const priceMin = qs.get("priceMin", "");
  const priceMax = qs.get("priceMax", "");

  type State = {
    rows: Product[];
    total: number;
    loading: boolean;
    error: string | null;
  };

  type Action =
    | { type: "start" }
    | { type: "success"; rows: Product[]; total: number; append: boolean }
    | { type: "error"; message: string }
    | { type: "upsert"; product: Product; mode: "create" | "edit" };

  const initialState: State = { rows: [], total: 0, loading: false, error: null };
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "start":
        return { ...state, loading: true, error: null };
      case "success":
        return {
          ...state,
          loading: false,
          error: null,
          total: action.total,
          rows: action.append ? [...state.rows, ...action.rows] : action.rows,
        };
      case "error":
        return { ...state, loading: false, error: action.message };
      case "upsert": {
        if (action.mode === "create") {
          return {
            ...state,
            rows: [action.product, ...state.rows],
            total: state.total + 1,
          };
        }
        return {
          ...state,
          rows: state.rows.map((p) => (p.id === action.product.id ? action.product : p)),
        };
      }
      default:
        return state;
    }
  }

  const [{ rows, total, loading, error }, dispatch] = useReducer(reducer, initialState);

  // Fetch when query changes
  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "start" });

    getProducts({
      q: q || undefined,
      take,
      skip,
      sortBy: sortBy || undefined,
      order,
    })
      .then((res) => {
        if (cancelled) return;
        dispatch({
          type: "success",
          rows: res.products,
          total: res.total,
          append: skip !== 0,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        dispatch({
          type: "error",
          message: e instanceof Error ? e.message : "Failed to load products",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [q, sortBy, order, take, skip]);

  const canShowMore = rows.length < total;

  function toggleSort(field: string) {
    const nextOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    qs.set({ sortBy: field, order: nextOrder, skip: 0 });
  }

  function showMore() {
    qs.set({ skip: skip + take });
  }

  const titleSortMark = sortBy === "title" ? (order === "asc" ? " ↑" : " ↓") : "";
  const priceSortMark = sortBy === "price" ? (order === "asc" ? " ↑" : " ↓") : "";

  const viewRows = useMemo(() => rows, [rows]);

  const filteredRows = useMemo(() => {
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    return rows.filter((p) => {
      if (category && (p.category ?? "").toLowerCase() !== category.toLowerCase()) return false;
      if (brand && !(p.brand ?? "").toLowerCase().includes(brand.toLowerCase())) return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      return true;
    });
  }, [rows, category, brand, priceMin, priceMax]);

  return (
    <div className="border-b pb-4 space-y-4">
      <div>
        <div className="text-xl font-semibold">Products</div>
        <div className="text-sm text-muted-foreground">
          Loaded {rows.length} / {total}. Shown {filteredRows.length}.
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setUpsertOpen(true);
          }}
        >
          Create product
        </Button>
      </div>

      {/* Рядок 2 — Пошук + фільтри */}
      <div className="flex flex-wrap items-end gap-2">
        <Input
          value={q}
          onChange={(e) => qs.set({ q: e.target.value, skip: 0 })}
          placeholder="Search..."
          className="w-64"
        />

        <Input
          value={category}
          onChange={(e) => qs.set({ category: e.target.value, skip: 0 })}
          placeholder="Category"
          className="w-48"
        />

        <Input
          value={brand}
          onChange={(e) => qs.set({ brand: e.target.value, skip: 0 })}
          placeholder="Brand"
          className="w-48"
        />

        <Input
          inputMode="numeric"
          value={priceMin}
          onChange={(e) => qs.set({ priceMin: e.target.value, skip: 0 })}
          placeholder="Price min"
          className="w-32"
        />

        <Input
          inputMode="numeric"
          value={priceMax}
          onChange={(e) => qs.set({ priceMax: e.target.value, skip: 0 })}
          placeholder="Price max"
          className="w-32"
        />

        <Button
          variant="outline"
          onClick={() =>
            qs.set({ q: "", category: "", brand: "", priceMin: "", priceMax: "", skip: 0 })
          }
        >
          Reset
        </Button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                Title{titleSortMark}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("price")}>
                Price{priceSortMark}
              </TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {viewRows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(p);
                        setUpsertOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && viewRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nothing found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={showMore} disabled={!canShowMore || loading}>
          Show more
        </Button>
      </div>

      <UpsertProductDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        product={editing}
        onSuccess={(saved, mode) => dispatch({ type: "upsert", product: saved, mode })}
      />
    </div>
  );
}
