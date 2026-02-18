import { makeAutoObservable } from "mobx";

class UiStore {
  loadingCount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  startLoading() {
    this.loadingCount += 1;
  }

  stopLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
  }

  get isLoading() {
    return this.loadingCount > 0;
  }
}

export const uiStore = new UiStore();
export type { UiStore };
