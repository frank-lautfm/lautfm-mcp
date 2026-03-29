const BASE_URL = "https://api.radioadmin.laut.fm";
const ORIGIN = "LautfmMCP";

export class RadioadminClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private buildHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Origin: ORIGIN,
      Accept: "application/json",
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  async get(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<unknown> {
    let url = `${BASE_URL}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return this.handleResponse(res);
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: this.buildHeaders("application/json"),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(res);
  }

  async patch(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: this.buildHeaders("application/json"),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(res);
  }

  async put(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: this.buildHeaders("application/json"),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(res);
  }

  async delete(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: this.buildHeaders(body !== undefined ? "application/json" : undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(res);
  }

  private async handleResponse(res: Response): Promise<unknown> {
    if (res.status === 204) {
      return { success: true, status: 204 };
    }
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (!res.ok) {
      const message =
        typeof data === "object" && data !== null && "messages" in data
          ? String((data as Record<string, unknown>).messages)
          : typeof data === "object" && data !== null && "message" in data
          ? String((data as Record<string, unknown>).message)
          : `HTTP ${res.status}: ${res.statusText}`;
      throw new ApiError(res.status, message, data);
    }
    return data;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
