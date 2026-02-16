import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { AuthRoute } from "@/features/auth/auth-route.tsx";
import { ProtectedLayout } from "@/widgets/protected-layout/ui/protected-layout.tsx";
import { ProductsPage } from "@/pages/products";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/products",
    element: (
      <AuthRoute>
        <ProtectedLayout />
      </AuthRoute>
    ),
    children: [
      { index: true, element: <Navigate to="products" replace /> },
      { path: "products", element: <ProductsPage /> },
    ],
  },
  { path: "*", element: <LoginPage /> },
]);
