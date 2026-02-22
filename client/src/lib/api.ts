/**
 * Central fetch wrapper — reads VITE_API_URL at build time.
 * For Vercel: set VITE_API_URL in the dashboard to your backend URL.
 * Locally it defaults to http://localhost:5000/api via .env
 *
 * Ensures /api suffix is always present, even if someone sets
 * VITE_API_URL without it (e.g. "https://backend.vercel.app").
 */
function buildBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";
  const trimmed = raw.replace(/\/+$/, ""); // strip trailing slashes
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const BASE_URL: string = buildBaseUrl();

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export interface ApiError {
  status: number;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const err: ApiError = { status: res.status, ...data };
    throw err;
  }

  return data as T;
}
