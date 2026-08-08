const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("closet_token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!res.ok) {
        console.warn(`[ApiClient] GET ${endpoint} responded with status ${res.status}`);
        return [] as unknown as T;
      }

      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for GET ${endpoint}. Serving fallback:`, err);
      return [] as unknown as T;
    }
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...(options?.headers || {}),
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!res.ok) {
        console.warn(`[ApiClient] POST ${endpoint} responded with status ${res.status}`);
        return { success: false } as unknown as T;
      }

      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for POST ${endpoint}:`, err);
      return { success: false } as unknown as T;
    }
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...(options?.headers || {}),
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!res.ok) {
        console.warn(`[ApiClient] PUT ${endpoint} responded with status ${res.status}`);
        return { success: false } as unknown as T;
      }

      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for PUT ${endpoint}:`, err);
      return { success: false } as unknown as T;
    }
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!res.ok) {
        console.warn(`[ApiClient] DELETE ${endpoint} responded with status ${res.status}`);
        return { success: false } as unknown as T;
      }

      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for DELETE ${endpoint}:`, err);
      return { success: false } as unknown as T;
    }
  }
}

export const apiClient = new ApiClient(API_BASE);
