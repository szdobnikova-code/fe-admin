import type { Product } from "@/entities/product/model/types";
import { deleteProduct } from "@/entities/product/api/products";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: (id: number) => void;
};

export function DeleteProductDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!product) return;
    try {
      setLoading(true);
      setError(null);
      await deleteProduct(product.id);
      toast.success("Product deleted");
      onSuccess(product.id);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] !p-0 !bg-white !opacity-100">
        {/* HEADER */}
        <div className="px-6 py-5">
          <DialogTitle className="text-xl font-semibold tracking-tight">Delete product</DialogTitle>
        </div>

        <div className="border-t" />

        {/* BODY */}
        <div className="px-6 py-5 space-y-2">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete&nbsp;
            <span className="text-black font-bold">{product?.title}</span>
          </p>

          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="border-t" />

        {/* FOOTER */}
        <div className="px-6 py-4 flex justify-end gap-3">
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
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
