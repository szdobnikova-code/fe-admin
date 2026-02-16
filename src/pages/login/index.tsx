import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useStores } from "@/app/providers/stores-context";
import { loginService } from "@/features/auth/login/service.ts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-3 border rounded-xl p-6"
      >
        <div className="text-lg font-semibold">Login</div>

        <Input placeholder="username" {...form.register("username")} />
        {form.formState.errors.username?.message && (
          <div className="text-sm text-red-600">{form.formState.errors.username.message}</div>
        )}

        <Input type="password" placeholder="password" {...form.register("password")} />
        {form.formState.errors.password?.message && (
          <div className="text-sm text-red-600">{form.formState.errors.password.message}</div>
        )}

        {form.formState.errors.root?.message && (
          <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>
        )}

        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
