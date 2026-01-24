 
import { CommonApiService } from "./CommonApiService";
import type { ApiResponse } from "../types/auth.types";
import type { ApiKey, CreateApiKeyRequest } from "../types/common.types";

class CustomerService extends CommonApiService {
    constructor() {
        super();
        // Override base URL for customer API
        const baseURL = process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "https://api-api-hhlrwruw3q-uc.a.run.app/v1/customers";
        console.log('🔧 CustomerService: Using customer API base URL:', baseURL);
        this.baseURL = baseURL;
    }

    /**
     * Get API Keys
     * GET /v1/customers/key
     */
    async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
        const response = await this.get<ApiResponse<ApiKey[]>>("/key");
        if (!response) throw new Error("Failed to fetch API keys");
        return response;
    }

    /**
     * Create API Key
     * POST /v1/customers/key
     */
    async createApiKey(data: CreateApiKeyRequest): Promise<ApiResponse<ApiKey>> {
        const response = await this.post<ApiResponse<ApiKey>>("/key", data);
        if (!response) throw new Error("Failed to create API key");
        return response;
    }

    /**
     * Delete API Key
     * DELETE /v1/customers/key/:id
     */
    async deleteApiKey(id: string): Promise<ApiResponse<void>> {
        const response = await this.delete<ApiResponse<void>>(`/key/${id}`);
        if (!response) throw new Error("Failed to delete API key");
        return response;
    }
}

export const customerService = new CustomerService();

