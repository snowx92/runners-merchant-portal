import { ApiService } from "./ApiService";
import { CommonApiService } from "./CommonApiService";
import type { ApiResponse } from "../types/auth.types";
import type { HomeAnalytics, Banner, OrdersResponse } from "../types/home.types";
import type { UserAddress } from "../types/address.types";

/**
 * HomeService uses customers base URL (/v1/customers)
 * Endpoints: /home, /orders/
 *
 * Note: ApiService returns just the data, not wrapped in { status, message, data }
 */
class HomeService extends ApiService {
  /**
   * Get home analytics (current orders, finished orders, net profit)
   * GET /v1/customers/home
   * Returns: HomeAnalytics directly (not wrapped)
   */
  async getAnalytics(): Promise<HomeAnalytics | null> {
    const response = await this.get<HomeAnalytics>("/home");

    if (!response) {
      throw new Error("Failed to fetch analytics");
    }

    return response;
  }

  /**
   * Get recent orders with pagination
   * GET /v1/customers/orders/?pageNo=1&limit=10
   * Returns: OrdersResponse directly (not wrapped)
   */
  async getOrders(pageNo: number = 1, limit: number = 3): Promise<OrdersResponse | null> {
    const response = await this.get<OrdersResponse>(
      `/orders/`,
      { pageNo: pageNo.toString(), limit: limit.toString() }
    );

    if (!response) {
      throw new Error("Failed to fetch orders");
    }

    return response;
  }

  /**
   * Get user addresses
   * GET /v1/customers/addresses
   * Returns: UserAddress[] directly (not wrapped)
   */
  async getAddresses(): Promise<UserAddress[] | null> {
    const response = await this.get<UserAddress[]>("/addresses");

    if (!response) {
      throw new Error("Failed to fetch addresses");
    }

    return response;
  }
}

/**
 * BannerService uses common base URL
 * Base: /v1 + path: /common/banners/
 */
class BannerService extends CommonApiService {
  /**
   * Get banners
   * GET /v1/common/banners/
   */
  async getBanners(): Promise<ApiResponse<Banner[]>> {
    const response = await this.get<ApiResponse<Banner[]>>(
      "/common/banners/"
    );

    if (!response) {
      throw new Error("Failed to fetch banners");
    }

    return response;
  }
}

export const homeService = new HomeService();
export const bannerService = new BannerService();
