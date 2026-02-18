import { sessionStore } from "@/entities/session/model/session-store";
import { uiStore } from "@/shared/model/ui-store";

export const stores = { sessionStore, uiStore };
export type Stores = typeof stores;
