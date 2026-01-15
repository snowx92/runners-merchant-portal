/**
 * Courier Profile Information
 * GET /v1/customers/courier/:id
 */
export interface CourierProfile {
  counters: {
    success: number;
    accepted_bids: number;
  };
  id: string;
  uniqueId: string;
  email: string;
  fistName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  balance: number;
  type: "COURIER";
  phoneNumber: string;
  deliveryMethod: "WALKING" | "BICYCLE" | "MOTORCYCLE" | "CAR";
  verified: boolean;
  hasPassword: boolean;
  isTester: boolean;
  reviews: {
    count: number;
    average: number;
  };
  authProviders: {
    emailProvider: boolean;
    googleProvider: boolean;
    appleProvider: boolean;
  };
}

/**
 * Response from getting courier profile
 */
export interface CourierProfileResponse {
  status: number;
  message: string;
  data: CourierProfile;
}

/**
 * Courier Review
 */
export interface CourierReview {
  id: string;
  on: string; // Courier ID
  stars: number;
  review: string;
  by: string; // Merchant ID
  createdAt: string | {
    _seconds: number;
    _nanoseconds: number;
  };
}

/**
 * Response from getting courier reviews
 * GET /v1/customers/courier/:id/reviews
 */
export interface CourierReviewsResponse {
  status: number;
  message: string;
  data: {
    items: CourierReview[];
    pageItems: number;
    totalItems: number;
    isLastPage: boolean;
    nextPageNumber: number | null;
    currentPage: number;
    totalPages: number;
  };
}

/**
 * Request body for adding a courier review
 * POST /v1/customers/courier/:id/review
 */
export interface AddCourierReviewRequest {
  stars: number;
  review: string;
}

/**
 * Response from adding a courier review
 */
export interface AddCourierReviewResponse {
  status: number;
  message: string;
  data: CourierReview;
}

/**
 * Request body for adding an order review
 * POST /v1/customers/reviews/:orderId
 */
export interface AddOrderReviewRequest {
  stars: number;
  content: string;
}

/**
 * Response from adding an order review
 */
export interface AddOrderReviewResponse {
  status: number;
  message: string;
  data: {
    id: string;
    on: string; // Courier ID
    stars: number;
    review: string;
    by: string; // Merchant ID
    createdAt: string;
  };
}
