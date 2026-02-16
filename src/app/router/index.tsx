import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { ProductsPage } from "@/pages/products";
import { AuthRoute } from "@/features/auth/auth-route.tsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/products",
    element: (
      <AuthRoute>
        <ProductsPage />
      </AuthRoute>
    ),
  },
  { path: "*", element: <LoginPage /> },
]);
