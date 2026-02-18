import { observer } from "mobx-react-lite";
import { LoaderCircle } from "lucide-react";
import { useStores } from "@/app/providers/stores-context";

export const GlobalSpinner = observer(() => {
  const { uiStore } = useStores();

  if (!uiStore.isLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <LoaderCircle className="h-9 w-9 animate-spin text-white" />
    </div>
  );
});
