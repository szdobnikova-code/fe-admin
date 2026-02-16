import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { AuthRoute } from "@/features/auth/auth-route.tsx";
import { ProtectedLayout } from "@/widgets/protected-layout/ui/protected-layout.tsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/products",
    element: (
      <AuthRoute>
        <ProtectedLayout />
      </AuthRoute>
    ),
  },
  { path: "*", element: <LoginPage /> },
]);
