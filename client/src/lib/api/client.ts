const API_BASE = "http://localhost:4000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: HeadersInit;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
