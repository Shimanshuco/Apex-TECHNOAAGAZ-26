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

// Simple in-memory cache for GET requests (improves perceived performance)
const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache for GET requests

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  cache?: boolean; // Enable caching for this request (default: true for GET)
  timeout?: number; // Request timeout in ms (default: 15000)
}

export interface ApiError {
  status: number;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: unknown; // Additional error data
}

// Helper to create abort controller with timeout
function createAbortController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { 
    method = "GET", 
    body, 
    token, 
    cache = method === "GET",
    timeout = 15000 
  } = options;

  const cacheKey = `${method}:${endpoint}:${token || 'anon'}`;

  // Check cache for GET requests
  if (cache && method === "GET") {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = createAbortController(timeout);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      const err: ApiError = { status: res.status, ...data };
      throw err;
    }

    // Cache successful GET responses
    if (cache && method === "GET") {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw { status: 408, success: false, message: 'Request timeout' } as ApiError;
    }
    throw error;
  }
}

// Clear cache utility (call after mutations)
export function clearApiCache(endpoint?: string): void {
  if (endpoint) {
    for (const key of requestCache.keys()) {
      if (key.includes(endpoint)) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
}
