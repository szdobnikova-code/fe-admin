export type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  rating: number;
  brand?: string;
  category?: string;
  description?: string;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
