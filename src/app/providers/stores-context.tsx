import React from "react";
import { stores } from "./stores";

export const StoresContext = React.createContext(stores);
export const useStores = () => React.useContext(StoresContext);
