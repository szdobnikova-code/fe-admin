import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { ProductsPage } from "@/pages/products";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "*", element: <LoginPage /> },
]);
