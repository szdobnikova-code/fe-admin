import { useSearchParams } from "react-router-dom";

export function useQueryState() {
  const [sp, setSp] = useSearchParams();

  const get = (key: string, fallback = "") => sp.get(key) ?? fallback;

  const set = (patch: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    setSp(next, { replace: true });
  };

  return { get, set };
}
