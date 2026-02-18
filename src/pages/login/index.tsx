import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useStores } from "@/app/providers/stores-context";
import { loginService } from "@/features/auth/login/service.ts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { LockKeyhole } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const nav = useNavigate();
  const { sessionStore } = useStores();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await loginService(data.username, data.password);
      const token = res.accessToken ?? res.token;
      if (!token) throw new Error("Token missing in response");
      sessionStore.setToken(token);
      nav("/products", { replace: true });
    } catch (e) {
      form.setError("root", { message: e instanceof Error ? e.message : "Login failed" });
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] rounded-xl bg-background border shadow-sm p-6">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <LockKeyhole className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="text-2xl font-semibold tracking-tight">Admin Panel Login</div>
          <div className="text-sm text-muted-foreground">
            Use your credentials to access admin panel.
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Username</div>
            <Input className="h-10" placeholder="username" {...form.register("username")} />
            {form.formState.errors.username?.message && (
              <div className="text-xs text-destructive">
                {form.formState.errors.username.message}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium">Password</div>
            <Input
              className="h-10"
              type="password"
              placeholder="password"
              {...form.register("password")}
            />
            {form.formState.errors.password?.message && (
              <div className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </div>
            )}
          </div>

          {form.formState.errors.root?.message && (
            <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>
          )}

          <Button
            className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 text-xs text-muted-foreground text-center">
          Demo credentials: <span className="font-medium text-foreground">emilys / emilyspass</span>
        </div>
      </div>
    </div>
  );
}
