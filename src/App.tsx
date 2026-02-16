import {RouterProvider} from "react-router-dom";
import {router} from "@/app/router";
import {StoresContext} from "@/app/providers/stores-context.tsx";
import {stores} from "@/app/providers/stores.ts";

function App() {

  return (
      <StoresContext.Provider value={stores}>
          <RouterProvider router={router} />
      </StoresContext.Provider>
  )
}

export default App
