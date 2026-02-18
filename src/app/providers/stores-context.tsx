import { createContext, useContext } from "react";
import type { Stores } from "@/app/providers/stores";

export const StoresContext = createContext<Stores | null>(null);

export function useStores(): Stores {
  const ctx = useContext(StoresContext);
  if (!ctx) throw new Error("useStores must be used within StoresContext.Provider");
  return ctx;
}
