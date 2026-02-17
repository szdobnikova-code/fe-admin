import type { Product } from "@/entities/product/model/types";
import { deleteProduct } from "@/entities/product/api/products";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm">
            Are you sure you want to delete <span className="font-medium">{product?.title}</span>?
          </div>
          <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={!product || loading}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
