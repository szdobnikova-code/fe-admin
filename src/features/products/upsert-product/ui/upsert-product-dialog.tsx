import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Product } from "@/entities/product/model/types";
import { createProduct, updateProduct } from "@/features/products/upsert-product/api/products";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
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
  categories: string[]; // ✅ dynamic categories from ProductsPage
  onSuccess: (saved: Product, mode: "create" | "edit") => void;
};

export function UpsertProductDialog({ open, onOpenChange, product, categories, onSuccess }: Props) {
  const isEdit = Boolean(product);

  // ✅ stable defaults derived from props
  const defaultValues = useMemo<UpsertProductFormInput>(
    () => ({
      title: product?.title ?? "",
      price: product?.price ?? 1,
      stock: product?.stock ?? 0,
      category: product?.category ?? "",
      brand: product?.brand ?? "",
    }),
    [product],
  );

  // ✅ key forces RHF to re-initialize when switching create/edit or editing another row
  const formKey = product?.id ?? "new";

  const form = useForm<UpsertProductFormInput>({
    resolver: zodResolver(upsertProductSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const categoryValue = useWatch({ control: form.control, name: "category" });

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

      toast.success(isEdit ? "Product updated" : "Product created");
      onSuccess(saved, isEdit ? "edit" : "create");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] !p-0 !bg-white !opacity-100">
        {/* HEADER */}
        <div className="px-5 py-5">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit product" : "Create product"}
          </DialogTitle>
        </div>

        <div className="border-t" />

        {/* FORM */}
        <form key={formKey} onSubmit={form.handleSubmit(submit)} className="px-5 pt-4 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Title</div>
            <Input className="h-10" {...form.register("title")} />
            {form.formState.errors.title?.message && (
              <div className="text-xs text-destructive">{form.formState.errors.title.message}</div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Price</div>
            <Input className="h-10" type="number" {...form.register("price")} />
            {form.formState.errors.price?.message && (
              <div className="text-xs text-destructive">{form.formState.errors.price.message}</div>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Stock</div>
            <Input className="h-10" type="number" {...form.register("stock")} />
            {form.formState.errors.stock?.message && (
              <div className="text-xs text-destructive">{form.formState.errors.stock.message}</div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Category</div>
            <Select
              value={categoryValue || ""}
              onValueChange={(v) => form.setValue("category", v, { shouldValidate: true })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category?.message && (
              <div className="text-xs text-destructive">
                {form.formState.errors.category.message}
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Brand</div>
            <Input className="h-10" {...form.register("brand")} />
          </div>

          {/* Root error if you ever set it */}
          {form.formState.errors.root?.message && (
            <div className="text-xs text-destructive">{form.formState.errors.root.message}</div>
          )}

          {/* Divider */}
          <div className="-mx-5 border-t mt-2" />

          {/* FOOTER */}
          <div className="py-3 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-4 hover:bg-muted/60"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-10 px-4 bg-blue-600 text-white hover:bg-blue-700"
              disabled={form.formState.isSubmitting}
            >
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
