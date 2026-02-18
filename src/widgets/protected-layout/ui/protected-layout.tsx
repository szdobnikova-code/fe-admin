import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { useStores } from "@/app/providers/stores-context";
import { Package, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-blue-50 text-blue-600"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
  ].join(" ");

export function ProtectedLayout() {
  const nav = useNavigate();
  const { sessionStore } = useStores();

  const onLogout = () => {
    sessionStore.logout();
    nav("/login", { replace: true });
  };

  const Sidebar = (
    <aside className="bg-background border-r p-4 flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="mb-8 shrink-0">
        <div className="text-lg font-semibold">Admin Panel</div>
        <div className="text-sm text-muted-foreground">Digital products</div>
      </div>

      {/* NAV */}
      <nav className="space-y-1 flex-1 overflow-auto">
        <NavLink to="/products" className={linkClass}>
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </span>
        </NavLink>
      </nav>

      {/* LOGOUT */}
      <div className="pt-4 border-t shrink-0">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/60"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">{Sidebar}</div>

      <main className="bg-muted/30 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 border-b bg-background px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-muted/60"
                aria-label="Open menu"
                title="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-[280px]">
              <div className="h-screen">{Sidebar}</div>
            </SheetContent>
          </Sheet>

          <div className="font-semibold">Admin Panel</div>
        </div>

        <div className="p-4">
          <div className="mx-auto max-w-6xl rounded-xl bg-background p-4 shadow-sm">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
