import { useState } from "react";
import type { Product } from "@/entities/product/model/types";
import { deleteProduct } from "@/features/products/delete-product/api/products";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: (id: number) => void;
};

export function DeleteProductDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!product) return;

    setLoading(true);
    setError(null);

    try {
      await deleteProduct(product.id);
      toast.success("Product deleted");
      onSuccess(product.id);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(msg);
      setError(msg); // ✅ no longer dead
    } finally {
      setLoading(false);
    }
  }

  const title = "Delete product";
  const desc = product
    ? `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
    : "Are you sure you want to delete this product?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] !p-0 !bg-white !opacity-100">
        <div className="px-5 py-5">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {desc}
          </DialogDescription>
        </div>

        <div className="border-t" />

        <div className="px-5 py-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="border-t" />

        <div className="px-5 py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-4 hover:bg-muted/60"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="h-10 px-4 bg-red-600 text-white hover:bg-red-700"
            onClick={onDelete}
            disabled={loading} // ✅ disable
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
