import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { useStores } from "@/app/providers/stores-context";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm transition-colors ${
    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
  }`;

export function ProtectedLayout() {
  const nav = useNavigate();
  const { sessionStore } = useStores();

  const onLogout = () => {
    sessionStore.logout();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-muted/30 p-4">
        <div className="mb-4 text-lg font-semibold">Admin</div>

        <nav className="space-y-1">
          <NavLink to="products" className={linkClass}>
            Products
          </NavLink>
        </nav>

        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <main className="p-6">
        <main className="p-6">
          <Outlet />
        </main>
      </main>
    </div>
  );
}
