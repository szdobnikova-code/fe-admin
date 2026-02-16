import { useEffect, useMemo, useReducer } from "react";
import { getProducts } from "@/entities/product/api/products";
import type { Product } from "@/entities/product/model/types";
import { useQueryState } from "@/shared/lib/use-query-state";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export function ProductsPage() {
  const qs = useQueryState();

  // URL state (single source of truth)
  const q = qs.get("q", "");
  const sortBy = qs.get("sortBy", "");
  const order = (qs.get("order", "asc") as "asc" | "desc") || "asc";
  const take = Number(qs.get("take", "10"));
  const skip = Number(qs.get("skip", "0"));

  type State = {
    rows: Product[];
    total: number;
    loading: boolean;
    error: string | null;
  };

  type Action =
    | { type: "start" }
    | { type: "success"; rows: Product[]; total: number; append: boolean }
    | { type: "error"; message: string };

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

  function onSearch(v: string) {
    qs.set({ q: v, skip: 0 }); // reset paging
  }

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Products</div>
          <div className="text-sm text-muted-foreground">
            Loaded {rows.length} / {total} {loading ? "(loading...)" : ""}
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="w-64"
          />
          <Button variant="outline" onClick={() => qs.set({ q: "", skip: 0 })} disabled={!q}>
            Clear
          </Button>
        </div>
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
                    <Button size="sm" variant="outline">
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
    </div>
  );
}
