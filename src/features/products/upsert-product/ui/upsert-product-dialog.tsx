import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Product } from "@/entities/product/model/types";
import { createProduct, updateProduct } from "@/entities/product/api/products";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import {
  upsertProductSchema,
  type UpsertProductFormInput,
  type UpsertProductFormOutput,
} from "../model/schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: (saved: Product, mode: "create" | "edit") => void;
};

const CATEGORY_OPTIONS = [
  "smartphones",
  "laptops",
  "fragrances",
  "skincare",
  "groceries",
  "home-decoration",
];

export function UpsertProductDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const isEdit = Boolean(product);

  const form = useForm<UpsertProductFormInput>({
    resolver: zodResolver(upsertProductSchema),
    defaultValues: {
      title: "",
      price: 1,
      stock: 0,
      category: "",
      brand: "",
    },
  });

  // Коли відкрили модалку — підставити значення для edit або скинути для create
  useEffect(() => {
    if (!open) return;

    if (product) {
      form.reset({
        title: product.title ?? "",
        price: product.price ?? 1,
        stock: product.stock ?? 0,
        category: product.category ?? "",
        brand: product.brand ?? "",
      });
    } else {
      form.reset({ title: "", price: 1, stock: 0, category: "", brand: "" });
    }
  }, [open, product, form]);

  async function submit(values: UpsertProductFormInput) {
    try {
      const parsed: UpsertProductFormOutput = upsertProductSchema.parse(values);

      const payload = {
        title: parsed.title,
        price: parsed.price,
        stock: parsed.stock,
        category: parsed.category,
        brand: parsed.brand || undefined,
      };

      const saved = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      toast.success(product ? "Product updated" : "Product created");
      onSuccess(saved, product ? "edit" : "create");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] !bg-white !opacity-100">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Create product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm">Title</div>
            <Input placeholder="iPhone 14" {...form.register("title")} />
            {form.formState.errors.title?.message && (
              <div className="text-sm text-red-600">{form.formState.errors.title.message}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm">Price</div>
              <Input inputMode="decimal" placeholder="999" {...form.register("price")} />
              {form.formState.errors.price?.message && (
                <div className="text-sm text-red-600">{form.formState.errors.price.message}</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm">Stock</div>
              <Input inputMode="numeric" placeholder="10" {...form.register("stock")} />
              {form.formState.errors.stock?.message && (
                <div className="text-sm text-red-600">{form.formState.errors.stock.message}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm">Category</div>

              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.formState.errors.category?.message && (
                <div className="text-sm text-red-600">{form.formState.errors.category.message}</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm">Brand</div>
              <Input placeholder="Apple" {...form.register("brand")} />
            </div>
          </div>

          {form.formState.errors.root?.message && (
            <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
