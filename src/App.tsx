import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { StoresContext } from "@/app/providers/stores-context.tsx";
import { stores } from "@/app/providers/stores.ts";
import { Toaster } from "@/shared/ui/sonner";
import { GlobalSpinner } from "@/shared/ui/global-spinner";

function App() {
  return (
    <StoresContext.Provider value={stores}>
      <GlobalSpinner />
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </StoresContext.Provider>
  );
}

export default App;
