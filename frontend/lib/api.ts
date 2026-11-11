const API_PATH = "/api/v1";

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
    // Unauthorized, trigger logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }

  return response;
}
