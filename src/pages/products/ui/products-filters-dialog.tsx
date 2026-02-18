import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const ALL_CATEGORIES = "__all__";

export type ProductsFiltersDraft = {
  category: string; // "" means all
  brand: string;
  priceMin: string;
  priceMax: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];

  // current filters from URL (source of truth)
  value: ProductsFiltersDraft;

  // apply draft to URL (parent decides how)
  onApply: (next: ProductsFiltersDraft) => void;
};

export function ProductsFiltersDialog({ open, onOpenChange, categories, value, onApply }: Props) {
  const [draft, setDraft] = useState<ProductsFiltersDraft>(value);

  const categoryValue = useMemo(
    () => (draft.category ? draft.category : ALL_CATEGORIES),
    [draft.category],
  );

  const canApply =
    draft.category !== value.category ||
    draft.brand !== value.brand ||
    draft.priceMin !== value.priceMin ||
    draft.priceMax !== value.priceMax;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    // sync draft only when opening
    if (nextOpen) {
      setDraft({
        category: value.category,
        brand: value.brand,
        priceMin: value.priceMin,
        priceMax: value.priceMax,
      });
    }
  }

  function apply() {
    onApply(draft);
    onOpenChange(false);
  }

  function cancel() {
    // revert draft to URL values and close
    setDraft({
      category: value.category,
      brand: value.brand,
      priceMin: value.priceMin,
      priceMax: value.priceMax,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] !p-0 !bg-white !opacity-100">
        <div className="px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">Filters</DialogTitle>
        </div>

        <div className="border-t" />

        <div className="px-6 py-5 space-y-4">
          {/* Category */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Category</div>
            <Select
              value={categoryValue}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, category: v === ALL_CATEGORIES ? "" : v }))
              }
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
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Brand</div>
            <Input
              className="h-10"
              placeholder="Brand"
              value={draft.brand}
              onChange={(e) => setDraft((d) => ({ ...d, brand: e.target.value }))}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Min price</div>
              <Input
                className="h-10"
                type="number"
                value={draft.priceMin}
                onChange={(e) => setDraft((d) => ({ ...d, priceMin: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Max price</div>
              <Input
                className="h-10"
                type="number"
                value={draft.priceMax}
                onChange={(e) => setDraft((d) => ({ ...d, priceMax: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="border-t" />

        <div className="px-6 py-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" className="hover:bg-muted/60" onClick={cancel}>
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={apply}
            disabled={!canApply}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
