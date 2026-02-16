import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { useStores } from "@/app/providers/stores-context";
import type { JSX } from "react";

export const AuthRoute = observer(({ children }: { children: JSX.Element }) => {
  const { sessionStore } = useStores();
  if (!sessionStore.isAuth) return <Navigate to="/login" replace />;
  return children;
});
