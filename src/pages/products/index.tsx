import { useEffect, useMemo, useReducer, useState } from "react";
import { Pencil, Plus, Trash2, X, SlidersHorizontal } from "lucide-react";

import { getProducts } from "@/entities/product";
import type { Product } from "@/entities/product";
import { useQueryState } from "@/shared/lib/use-query-state";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { UpsertProductDialog } from "@/features/products/upsert-product/ui/upsert-product-dialog";
import { DeleteProductDialog } from "@/features/products/delete-product/ui/delete-product-dialog";

import {
  ProductsFiltersDialog,
  type ProductsFiltersDraft,
} from "@/pages/products/ui/products-filters-dialog";

import { ProductsSearchInput } from "@/pages/products/ui/search-input";

const ALL_CATEGORIES = "__all__";

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
  | { type: "upsert"; product: Product; mode: "create" | "edit" }
  | { type: "remove"; id: number };

const initialState: State = { rows: [], total: 0, loading: false, error: null };

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
        return { ...state, rows: [action.product, ...state.rows], total: state.total + 1 };
      }
      return {
        ...state,
        rows: state.rows.map((p) => (p.id === action.product.id ? action.product : p)),
      };
    }
    case "remove":
      return {
        ...state,
        rows: state.rows.filter((p) => p.id !== action.id),
        total: Math.max(0, state.total - 1),
      };
    default:
      return state;
  }
}

function clampInt(raw: string, fallback: number, min: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.trunc(n));
}

export function ProductsPage() {
  const qs = useQueryState();

  // URL state (single source of truth)
  const q = qs.get("q", "");
  const sortBy = qs.get("sortBy", "");
  const order = (qs.get("order", "asc") as "asc" | "desc") || "asc";

  const take = clampInt(qs.get("take", "10"), 10, 1);
  const skip = clampInt(qs.get("skip", "0"), 0, 0);

  const category = qs.get("category", "");
  const brand = qs.get("brand", "");
  const priceMin = qs.get("priceMin", "");
  const priceMax = qs.get("priceMax", "");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [{ rows, total, loading, error }, dispatch] = useReducer(reducer, initialState);

  // debounce timers stored in module scope via window (no refs, no effects)
  // (handlers below clear/recreate timers)
  const debounceQKey = "__products_q_timer__";
  const debounceBrandKey = "__products_brand_timer__";

  const filtersActive = Boolean(category || brand || priceMin || priceMax);

  // client-side filters => load large batch once, no show more
  const effectiveTake = filtersActive ? 1000 : take;
  const effectiveSkip = filtersActive ? 0 : skip;

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [rows]);

  // Fetch when query changes (AbortController ok, no setState here)
  useEffect(() => {
    const controller = new AbortController();

    dispatch({ type: "start" });

    getProducts({
      q: q || undefined,
      take: effectiveTake,
      skip: effectiveSkip,
      sortBy: sortBy || undefined,
      order,
      signal: controller.signal,
    })
      .then((res) => {
        if (controller.signal.aborted) return;

        dispatch({
          type: "success",
          rows: res.products,
          total: res.total,
          append: !filtersActive && effectiveSkip > 0,
        });
      })
      .catch((e) => {
        if (controller.signal.aborted) return;

        dispatch({
          type: "error",
          message: e instanceof Error ? e.message : "Failed to load products",
        });
      });

    return () => controller.abort();
  }, [q, sortBy, order, effectiveTake, effectiveSkip, filtersActive]);

  const filteredRows = useMemo(() => {
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    return rows.filter((p) => {
      if (category && (p.category ?? "").toLowerCase() !== category.toLowerCase()) return false;
      if (brand && !(p.brand ?? "").toLowerCase().includes(brand.toLowerCase())) return false;
      if (min !== null && Number.isFinite(min) && p.price < min) return false;
      if (max !== null && Number.isFinite(max) && p.price > max) return false;
      return true;
    });
  }, [rows, category, brand, priceMin, priceMax]);

  const canShowMore = !filtersActive && rows.length < total;

  function toggleSort(field: string) {
    const nextOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    qs.set({ sortBy: field, order: nextOrder, skip: 0 });
  }

  function showMore() {
    if (!canShowMore || loading) return;
    qs.set({ skip: skip + take });
  }

  const titleSortMark = sortBy === "title" ? (order === "asc" ? " ↑" : " ↓") : "";
  const priceSortMark = sortBy === "price" ? (order === "asc" ? " ↑" : " ↓") : "";

  // ✅ debounced URL updates in handlers (no effects, no refs)
  function onQChange(next: string) {
    // @ts-expect-error attach to window
    const prev = window[debounceQKey] as number | undefined;
    if (prev) window.clearTimeout(prev);

    // @ts-expect-error attach to window
    window[debounceQKey] = window.setTimeout(() => {
      if (next !== q) qs.set({ q: next, skip: 0 });
    }, 350);
  }

  function onBrandChange(next: string) {
    // @ts-expect-error attach to window
    const prev = window[debounceBrandKey] as number | undefined;
    if (prev) window.clearTimeout(prev);

    // @ts-expect-error attach to window
    window[debounceBrandKey] = window.setTimeout(() => {
      if (next !== brand) qs.set({ brand: next, skip: 0 });
    }, 350);
  }

  const desktopFilters = (
    <div className="hidden md:flex flex-wrap items-center gap-3">
      <ProductsSearchInput
        key={`q-${q}`}
        className="w-[240px]"
        placeholder="Search products..."
        defaultValue={q}
        onDebouncedChange={onQChange}
      />

      {/* Category */}
      <div className="relative w-[210px]">
        <Select
          value={category ? category : ALL_CATEGORIES}
          onValueChange={(v) => qs.set({ category: v === ALL_CATEGORIES ? "" : v, skip: 0 })}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {category && (
          <button
            type="button"
            onClick={() => qs.set({ category: "", skip: 0 })}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Reset category"
            title="Reset"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ProductsSearchInput
        key={`brand-${brand}`}
        className="w-[170px]"
        placeholder="Brand"
        defaultValue={brand}
        clearAriaLabel="Clear brand"
        onDebouncedChange={onBrandChange}
      />

      <div className="relative w-[130px]">
        <Input
          type="number"
          placeholder="Min price"
          value={priceMin}
          onChange={(e) => qs.set({ priceMin: e.target.value, skip: 0 })}
          className="h-10 pr-9"
        />
        {priceMin && (
          <button
            type="button"
            onClick={() => qs.set({ priceMin: "", skip: 0 })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear min price"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative w-[130px]">
        <Input
          type="number"
          placeholder="Max price"
          value={priceMax}
          onChange={(e) => qs.set({ priceMax: e.target.value, skip: 0 })}
          className="h-10 pr-9"
        />
        {priceMax && (
          <button
            type="button"
            onClick={() => qs.set({ priceMax: "", skip: 0 })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear max price"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  const mobileFiltersRow = (
    <div className="md:hidden flex items-center gap-3">
      <ProductsSearchInput
        key={`q-m-${q}`}
        className="flex-1"
        placeholder="Search products..."
        defaultValue={q}
        onDebouncedChange={onQChange}
      />

      <Button variant="outline" className="h-10" onClick={() => setFiltersOpen(true)}>
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
      </Button>
    </div>
  );

  const currentFilters: ProductsFiltersDraft = { category, brand, priceMin, priceMax };

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xl font-semibold">Products</div>
          <div className="text-sm text-muted-foreground">Manage your digital products.</div>
        </div>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => {
            setEditing(null);
            setUpsertOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2 text-white" />
          Add Product
        </Button>
      </div>

      {mobileFiltersRow}
      {desktopFilters}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="border overflow-x-auto bg-background">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-muted/40">
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
            {filteredRows.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/40">
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>${p.price}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-transparent"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => {
                        setEditing(p);
                        setUpsertOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-transparent"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => {
                        setDeleting(p);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700 transition-colors" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Nothing found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Loaded {rows.length}
          {filtersActive ? "" : ` / ${total}`}. Shown {filteredRows.length}
        </span>

        {!filtersActive && (
          <button
            type="button"
            onClick={showMore}
            disabled={!canShowMore || loading}
            className={[
              "font-semibold",
              !canShowMore || loading
                ? "text-muted-foreground cursor-not-allowed"
                : "text-blue-600 hover:underline",
            ].join(" ")}
          >
            Show more
          </button>
        )}
      </div>

      <ProductsFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        categories={categories}
        value={currentFilters}
        onApply={(next) => {
          qs.set({
            category: next.category,
            brand: next.brand,
            priceMin: next.priceMin,
            priceMax: next.priceMax,
            skip: 0,
          });
        }}
        onReset={() => {
          qs.set({
            category: "",
            brand: "",
            priceMin: "",
            priceMax: "",
            skip: 0,
          });
        }}
      />

      <UpsertProductDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        product={editing}
        categories={categories}
        onSuccess={(saved, mode) => dispatch({ type: "upsert", product: saved, mode })}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={deleting}
        onSuccess={(id) => dispatch({ type: "remove", id })}
      />
    </div>
  );
}
