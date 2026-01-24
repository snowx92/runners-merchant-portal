/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SessionManager } from "@/lib/utils/session";

export const printLogs = true; // Enable logging for debugging

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/**
 * API Service for common endpoints (not dashboard-specific)
 * Uses /v1/common base path instead of /v1/dashboard
 */
export class CommonApiService {
  protected baseURL: string;
  protected sessionManager: SessionManager;

  constructor() {
    // Use dedicated common API base URL from environment
    this.baseURL = process.env.NEXT_PUBLIC_COMMON_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/dashboard', '/common') ||
      '/api/common';

    console.log('🔧 CommonApiService: Using common API base URL:', this.baseURL);

    this.sessionManager = SessionManager.getInstance();
  }

  async request<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body: any | null = null,
    queryParams: Record<string, string> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const query = new URLSearchParams(queryParams).toString();
    const fullUrl = query ? `${url}?${query}` : url;

    if (printLogs) {
      console.log('📨 CommonApiService.request:', { method, url: this.baseURL + fullUrl, hasBody: !!body });
    }

    // Check if we should skip authentication
    const skipAuth = customHeaders["Skip-Auth"] === "true";
    const headersToUse = { ...customHeaders };
    delete headersToUse["Skip-Auth"];

    if (skipAuth) {
      console.log('🔓 CommonApiService: Skipping authentication for', fullUrl);
      const staticHeaders = {
        Language: "ar",
      };
      return this.makeRequest(fullUrl, method, body, staticHeaders, headersToUse);
    }

    // Get token from session manager
    const token = await this.sessionManager.getCurrentToken();

    if (!token) {
      const storedToken = this.sessionManager.getToken();
      if (!storedToken) {
        throw new Error("Please log in to continue");
      }
    }

    const staticHeaders = {
      Authorization: `Bearer ${token || this.sessionManager.getToken()}`,
      Language: "ar",
    };

    return this.makeRequest(fullUrl, method, body, staticHeaders, headersToUse);
  }

  private async makeRequest<T>(
    fullUrl: string,
    method: string,
    body: any | null,
    staticHeaders: Record<string, string>,
    customHeaders: Record<string, string>
  ): Promise<T | null> {
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Client: "FETCH",
      ...customHeaders,
      ...staticHeaders,
    };

    // Remove Authorization header if it's undefined or empty
    if (!mergedHeaders.Authorization || mergedHeaders.Authorization === "Bearer undefined" || mergedHeaders.Authorization === "Bearer null") {
      delete mergedHeaders.Authorization;
    }

    console.log('📋 CommonApiService final headers:', mergedHeaders);

    const options: RequestInit = {
      method,
      headers: mergedHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${fullUrl}`, options);

      console.log("🌐 CommonApiService: Request to:", `${this.baseURL}${fullUrl}`);

      if (response.status < 200 || response.status >= 300) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse the error response, use the status text
        }

        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }

      try {
        const jsonResponse = await response.json();
        return jsonResponse as T;
      } catch {
        throw new Error(`Invalid JSON response from ${fullUrl}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    queryParams: Record<string, string> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    return this.request<T>(endpoint, "GET", null, queryParams, customHeaders);
  }

  async post<T>(
    endpoint: string,
    body: any = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    const filterBody = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined)
    );
    return this.request<T>(endpoint, "POST", filterBody, {}, customHeaders);
  }

  async put<T>(
    endpoint: string,
    body: any | null = null,
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    return this.request<T>(endpoint, "PUT", body, {}, customHeaders);
  }

  async delete<T>(
    endpoint: string,
    body: any | null = null,
    customHeaders: Record<string, string> = {}
  ): Promise<T | null> {
    return this.request<T>(endpoint, "DELETE", body, {}, customHeaders);
  }
}
