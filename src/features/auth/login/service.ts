import { apiService } from "@/shared/api/api-service.ts";

export type LoginResponse = {
  token?: string;
  accessToken?: string;
};

export function loginService(username: string, password: string) {
  return apiService<LoginResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
