export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  code?: number | string;
  error?: string;
  details?: unknown;
  [k: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: number | string;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = (payload as ApiErrorPayload | undefined)?.code;
    this.payload = payload;
  }
}

export class BaseService {
  protected baseUrl: string;

  constructor(endpoint: string) {
    // 👉 siempre apuntamos a la API intermedia de Next.js
    // ej: endpoint = "productos" → "/api/productos"
    const ep = endpoint.replace(/^\//, "");
    this.baseUrl = `/api/${ep}`;
  }

  protected buildQuery(params?: Record<string, unknown>) {
    const q = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) v.forEach((vv) => q.append(k, String(vv)));
      else q.append(k, String(v));
    });
    const s = q.toString();
    return s ? `?${s}` : "";
  }

  protected async request<T>(
    path: string,
    init?: RequestInit & { responseType?: "json" | "blob" | "text" }
  ): Promise<T> {
    const isFormData = init?.body instanceof FormData;
    const headers = isFormData
      ? init?.headers
      : { "Content-Type": "application/json", ...(init?.headers ?? {}) };

    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include", // 👉 cookies hacia API intermedia
      cache: "no-store", // evitar caching en llamadas dinámicas
      ...init,
      headers,
    });

    if (!res.ok) {
      let payload: ApiErrorPayload | string | undefined;
      try {
        payload = await res.clone().json();
      } catch {
        try {
          payload = await res.text();
        } catch {
          payload = undefined;
        }
      }
      const msg =
        (payload as ApiErrorPayload | undefined)?.message ||
        `HTTP ${res.status} ${res.statusText}`;
      throw new ApiError(res.status, msg, payload);
    }

    const type = init?.responseType ?? "json";
    if (type === "blob") return (await res.blob()) as unknown as T;
    if (type === "text") return (await res.text()) as unknown as T;
    return (await res.json()) as T;
  }

  // Helpers CRUD
  protected get<T>(path = "", params?: object) {
    console.log("params", params);
    console.log("path", path);
    return this.request<T>(`${path}${this.buildQuery(params as Record<string, unknown>)}`, {
      method: "GET",
    });
  }

  protected post<T>(path: string, body?: unknown) {
    const isForm = body instanceof FormData;
    return this.request<T>(path, {
      method: "POST",
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T>(path: string, body?: unknown) {
    const isForm = body instanceof FormData;
    return this.request<T>(path, {
      method: "PUT",
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  }

  protected del<T>(path: string, body?: unknown) {
    const isForm = body instanceof FormData;
    return this.request<T>(path, {
      method: "DELETE",
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  }

  protected download(path = "", params?: Record<string, unknown>) {
    return this.request<Blob>(`${path}${this.buildQuery(params)}`, {
      method: "GET",
      responseType: "blob",
    });
  }
}
