import { ApiService } from "./ApiService";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  CreateBulkOrdersRequest,
  CreateBulkOrdersResponse,
  SingleOrderResponse,
  LatestOrdersResponse,
  GetOrdersQueryParams,
  OrderActionResponse,
  OrderBidsResponse,
  UpdateBidRequest,
  OrdersResponse,
} from "../types/order.types";

/**
 * OrderService for managing orders
 * Uses ApiService with /v1/customers base URL
 *
 * Endpoints:
 * - GET /orders/ - Get orders with pagination and filters
 * - POST /orders/ - Create a single order
 * - POST /orders/bulk - Create bulk orders
 * - GET /orders/single/:id - Get a single order by ID
 * - GET /orders/latest - Get latest orders
 * - POST /orders/return/:id - Mark order as returned
 * - POST /orders/relist/:id - Re-list a failed order
 * - POST /orders/cancel/:id - Cancel current courier assignment
 * - GET /orders/bids/:id - Get bids for an order
 * - PUT /orders/bid/:id - Accept or reject a bid
 */
class OrderService extends ApiService {
  /**
   * Get orders with pagination and filters
   * GET /v1/customers/orders/
   * @param params Query parameters for filtering and pagination
   * @returns OrdersResponse with items and pagination info
   */
  async getOrders(params: GetOrdersQueryParams = {}): Promise<OrdersResponse | null> {
    const queryParams: Record<string, string> = {};

    if (params.pageNo) queryParams.pageNo = params.pageNo.toString();
    if (params.limit) queryParams.limit = params.limit.toString();
    if (params.status) queryParams.status = params.status;
    if (params.type) queryParams.type = params.type;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.search) queryParams.search = params.search;
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.priceFrom) queryParams.priceFrom = params.priceFrom;
    if (params.priceTo) queryParams.priceTo = params.priceTo;
    if (params.fromGovId) queryParams.fromGovId = params.fromGovId;
    if (params.toGovId) queryParams.toGovId = params.toGovId;
    if (params.fromCityId) queryParams.fromCityId = params.fromCityId;
    if (params.toCityId) queryParams.toCityId = params.toCityId;
    if (params.shippingPriceFrom) queryParams.shippingPriceFrom = params.shippingPriceFrom;
    if (params.shippingPriceTo) queryParams.shippingPriceTo = params.shippingPriceTo;

    const response = await this.get<OrdersResponse>("/orders/", queryParams);

    if (!response) {
      throw new Error("Failed to fetch orders");
    }

    return response;
  }

  /**
   * Create a single order
   * POST /v1/customers/orders/
   * @param orderData Order data to create
   * @returns Created order data
   */
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse | null> {
    const response = await this.post<CreateOrderResponse>("/orders/", orderData);

    if (!response) {
      throw new Error("Failed to create order");
    }

    return response;
  }

  /**
   * Create bulk orders
   * POST /v1/customers/orders/bulk
   * @param bulkData Array of orders to create
   * @returns Created orders data
   */
  async createBulkOrders(bulkData: CreateBulkOrdersRequest): Promise<CreateBulkOrdersResponse | null> {
    const response = await this.post<CreateBulkOrdersResponse>("/orders/bulk", bulkData);

    if (!response) {
      throw new Error("Failed to create bulk orders");
    }

    return response;
  }

  /**
   * Get a single order by ID
   * GET /v1/customers/orders/single/:id
   * @param orderId Order ID
   * @returns Single order data
   */
  async getSingleOrder(orderId: string): Promise<SingleOrderResponse | null> {
    const response = await this.get<SingleOrderResponse>(`/orders/single/${orderId}`);

    if (!response) {
      throw new Error("Failed to fetch order");
    }

    return response;
  }

  /**
   * Get latest orders
   * GET /v1/customers/orders/latest
   * @returns Latest orders data
   */
  async getLatestOrders(): Promise<LatestOrdersResponse | null> {
    const response = await this.get<LatestOrdersResponse>("/orders/latest");

    if (!response) {
      throw new Error("Failed to fetch latest orders");
    }

    return response;
  }

  /**
   * Mark an order as returned
   * POST /v1/customers/orders/return/:id
   * @param orderId Order ID to mark as returned
   * @returns Action response
   */
  async markAsReturned(orderId: string): Promise<OrderActionResponse | null> {
    const response = await this.post<OrderActionResponse>(`/orders/return/${orderId}`, {});

    if (!response) {
      throw new Error("Failed to mark order as returned");
    }

    return response;
  }

  /**
   * Re-list a failed order
   * POST /v1/customers/orders/relist/:id
   * @param orderId Order ID to re-list
   * @returns Action response
   */
  async relistOrder(orderId: string): Promise<OrderActionResponse | null> {
    const response = await this.post<OrderActionResponse>(`/orders/relist/${orderId}`, {});

    if (!response) {
      throw new Error("Failed to re-list order");
    }

    return response;
  }

  /**
   * Cancel current courier assignment for an order
   * POST /v1/customers/orders/cancel/:id
   * @param orderId Order ID to cancel courier
   * @returns Action response
   */
  async cancelCourier(orderId: string): Promise<OrderActionResponse | null> {
    const response = await this.post<OrderActionResponse>(`/orders/cancel/${orderId}`, {});

    if (!response) {
      throw new Error("Failed to cancel courier");
    }

    return response;
  }

  /**
   * Get bids for an order
   * GET /v1/customers/orders/bids/:id
   * @param orderId Order ID to get bids for
   * @returns Order bids data
   */
  async getOrderBids(orderId: string): Promise<OrderBidsResponse | null> {
    const response = await this.get<OrderBidsResponse>(`/orders/bids/${orderId}`);

    if (!response) {
      throw new Error("Failed to fetch order bids");
    }

    return response;
  }

  /**
   * Update a bid (accept or reject)
   * PUT /v1/customers/orders/bid/:id
   * @param bidId Bid ID to update
   * @param bidData Bid update data (accept or reject)
   * @returns Action response
   */
  async updateBid(bidId: string, bidData: UpdateBidRequest): Promise<OrderActionResponse | null> {
    const response = await this.put<OrderActionResponse>(`/orders/bid/${bidId}`, bidData);

    if (!response) {
      throw new Error("Failed to update bid");
    }

    return response;
  }
}

export const orderService = new OrderService();
