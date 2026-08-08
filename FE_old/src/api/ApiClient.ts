export class ApiClient {
  private static baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  private static getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  private static getAdminHeaders(): HeadersInit {
    const token = localStorage.getItem("admin_token");
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private static handleAdminAuthError() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  }

  static async adminGet<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getAdminHeaders()
    });
    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 401 || response.status === 403) {
        this.handleAdminAuthError();
      }
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async adminPut<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 401 || response.status === 403) {
        this.handleAdminAuthError();
      }
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async adminPost<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 401 || response.status === 403) {
        this.handleAdminAuthError();
      }
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async adminDelete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAdminHeaders()
    });
    if (!response.ok) {
      const errBody = await response.text();
      if (response.status === 401 || response.status === 403) {
        this.handleAdminAuthError();
      }
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }

  static async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errBody}`);
    }
    return await response.json();
  }
}
