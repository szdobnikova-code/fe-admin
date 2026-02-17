import { z } from "zod";

export const upsertProductSchema = z.object({
  title: z.string().min(1, "Required"),
  price: z.coerce.number().positive("Must be > 0"),
  stock: z.coerce.number().int().min(0, "Must be >= 0"),
  category: z.string().min(1, "Required"),
  brand: z.string().optional(),
});

export type UpsertProductFormInput = z.input<typeof upsertProductSchema>;

export type UpsertProductFormOutput = z.output<typeof upsertProductSchema>;
