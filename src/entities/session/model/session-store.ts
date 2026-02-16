import { makeAutoObservable } from "mobx";

const TOKEN_KEY = "accessToken";

export class SessionStore {
  accessToken: string | null = localStorage.getItem(TOKEN_KEY);

  constructor() {
    makeAutoObservable(this);
  }

  get isAuth() {
    return Boolean(this.accessToken);
  }

  setToken(token: string) {
    this.accessToken = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const sessionStore = new SessionStore();
