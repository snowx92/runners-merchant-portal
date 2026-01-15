import { ApiService } from "./ApiService";
import type {
  CourierProfileResponse,
  CourierReviewsResponse,
  AddCourierReviewRequest,
  AddCourierReviewResponse,
  AddOrderReviewRequest,
  AddOrderReviewResponse,
} from "../types/courier.types";

/**
 * CourierService for managing courier profiles and reviews
 * Uses ApiService with /v1/customers base URL
 *
 * Endpoints:
 * - GET /courier/:id - Get courier profile
 * - GET /courier/:id/reviews - Get courier reviews with pagination
 * - POST /courier/:id/review - Add a review for a courier
 * - POST /reviews/:orderId - Add a review for an order
 */
class CourierService extends ApiService {
  /**
   * Get courier profile by ID
   * GET /v1/customers/courier/:id
   * @param courierId Courier ID
   * @returns Courier profile data
   */
  async getCourierProfile(courierId: string): Promise<CourierProfileResponse | null> {
    const response = await this.get<CourierProfileResponse>(`/courier/${courierId}`);

    if (!response) {
      throw new Error("Failed to fetch courier profile");
    }

    return response;
  }

  /**
   * Get courier reviews with pagination
   * GET /v1/customers/courier/:id/reviews
   * @param courierId Courier ID
   * @param pageNo Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Courier reviews with pagination
   */
  async getCourierReviews(
    courierId: string,
    pageNo: number = 1,
    limit: number = 10
  ): Promise<CourierReviewsResponse | null> {
    const queryParams = {
      pageNo: pageNo.toString(),
      limit: limit.toString(),
    };

    const response = await this.get<CourierReviewsResponse>(
      `/courier/${courierId}/reviews`,
      queryParams
    );

    if (!response) {
      throw new Error("Failed to fetch courier reviews");
    }

    return response;
  }

  /**
   * Add a review for a courier
   * POST /v1/customers/courier/:id/review
   * @param courierId Courier ID
   * @param reviewData Review data (stars and review text)
   * @returns Created review data
   */
  async addCourierReview(
    courierId: string,
    reviewData: AddCourierReviewRequest
  ): Promise<AddCourierReviewResponse | null> {
    const response = await this.post<AddCourierReviewResponse>(
      `/courier/${courierId}/review`,
      reviewData
    );

    if (!response) {
      throw new Error("Failed to add courier review");
    }

    return response;
  }

  /**
   * Add a review for an order
   * POST /v1/customers/reviews/:orderId
   * @param orderId Order ID
   * @param reviewData Review data (stars and content)
   * @returns Created review data
   */
  async addOrderReview(
    orderId: string,
    reviewData: AddOrderReviewRequest
  ): Promise<AddOrderReviewResponse | null> {
    const response = await this.post<AddOrderReviewResponse>(
      `/reviews/${orderId}`,
      reviewData
    );

    if (!response) {
      throw new Error("Failed to add order review");
    }

    return response;
  }
}

export const courierService = new CourierService();
