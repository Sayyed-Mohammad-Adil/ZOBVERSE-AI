const API_PATH = "/api/v1";
export const AUTH_SESSION_MAX_AGE_SECONDS = 8 * 24 * 60 * 60;

export function setAuthSession(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", token);
  document.cookie = `oj_session=${token}; path=/; max-age=${AUTH_SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
  document.cookie = `access_token=${token}; path=/; max-age=${AUTH_SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  document.cookie = "oj_session=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

function normalizeApiBase(url: string): string {
  const base = url.replace(/\/+$/, "");
  return base.endsWith(API_PATH) ? base : `${base}${API_PATH}`;
}

export function getApiUrl(): string {
  if (typeof window !== "undefined") return API_PATH;
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  }
  return normalizeApiBase("http://localhost:8000");
}

export const API_URL = getApiUrl();

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = getApiUrl();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith("http") ? endpoint : `${baseUrl}${cleanEndpoint}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot reach the API at ${fullUrl}. Make sure the backend is running and reachable.`,
        { cause: error },
      );
    }
    throw error;
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      clearAuthSession();
      window.location.assign("/login");
    }
  }

  return response;
}
