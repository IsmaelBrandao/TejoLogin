import { Platform } from "react-native";

const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  (Platform.OS === "web" ? "" : "http://localhost:3333");

type ApiOptions = RequestInit & {
  token?: string;
};

export type AuthPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
  };
  token: string;
};

export type ApiMessage = {
  ok: boolean;
  message: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  const baseUrl = DEFAULT_API_URL.replace(/\/$/, "");
  const url = `${baseUrl}${path}`;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Nao foi possivel conectar ao servidor. Tente novamente em instantes.",
      0
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Nao foi possivel concluir esta acao agora.",
      response.status
    );
  }

  return payload as T;
}
