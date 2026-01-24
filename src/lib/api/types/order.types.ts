// Re-export existing order types from home.types.ts
export type {
  Order,
  OrdersResponse,
  OrderCustomer,
  OrderPickup,
  OrderCourier,
} from "./home.types";

/**
 * Request body for creating a single order (new API format)
 * POST /v1/customers/orders/
 * Body example:
 * {
 *   "name": "Shreif Customer",
 *   "phone": "01114077125",
 *   "address": "1 Asia St, Nile Cornish, Maadi",
 *   "cityId": "UXgOcotYrdYDdXFUA32D",
 *   "govId": "P4u8oppR5537YIFyRwfa",
 *   "pickupId": "Fiut1jxWhn4XjLrvhVVf",
 *   "cash": 100.00,
 *   "fees": 65.00,
 *   "content": "Electronics - TV, Laptop",
 *   "notes": "Leave the package at the front door.",
 *   "type": "COD" // COD, PREPAID
 * }
 */
export interface CreateOrderRequest {
  name: string;
  phone: string;
  address: string;
  cityId: string;
  govId: string;
  pickupId: string;
  cash: number;
  fees: number;
  content: string;
  notes: string;
  type: "COD" | "PREPAID";
}

/**
 * Request body for creating bulk orders
 * POST /v1/customers/orders/bulk
 */
export interface CreateBulkOrdersRequest {
  orders: CreateOrderRequest[];
}

/**
 * Response from creating a single order
 */
export interface CreateOrderResponse {
  status: number;
  message: string;
  data: {
    id: string;
    qrCode: string;
    cash: number;
    type: "COD" | "PREPAID";
    shippingAmount: number;
    otp: string | null;
    receiveOTP: string;
    cancelOTP?: string | null;
    courierShippingAmount: number;
    status: string;
    cashStatus: string;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    bidsCount: number;
    bids: unknown[];
    canRate: boolean;
    notes: string;
    content: string;
    attachment: string;
    requiredSupplierFailedAmount: number;
    selectedCourier: unknown | null;
    pickup: {
      id: string;
      title: string;
      latitude: number;
      longitude: number;
      street: string;
      city: string;
      cityId: string;
      state: string;
      stateId: string;
      phoneNumber: string;
      buildingNumber: string;
      floorNumber: string;
      apartmentNumber: string;
      notes: string;
    };
    failedInfo: unknown | null;
    customer: {
      phone: string;
      otherPhone: string;
      address: string;
      name: string;
      gov: string;
      city: string;
      govId: string;
      cityId: string;
      dropOffLocation: {
        lat: number;
        lng: number;
        hash: string;
        isSystemGenerated: boolean;
      } | null;
      distanceBetweenPickupAndDropOffInKm: number;
    };
  };
}

/**
 * Response from creating bulk orders
 */
export interface CreateBulkOrdersResponse {
  status: number;
  message: string;
  data: {
    orders: CreateOrderResponse["data"][];
  };
}

/**
 * Response from getting a single order
 * GET /v1/customers/orders/single/:id
 */
export interface SingleOrderResponse {
  status: number;
  message: string;
  data: CreateOrderResponse["data"];
}

/**
 * Response from getting latest orders
 * GET /v1/customers/orders/latest
 */
export interface LatestOrdersResponse {
  status: number;
  message: string;
  data: CreateOrderResponse["data"][];
}

/**
 * Query parameters for getting orders
 * GET /v1/customers/orders/
 */
export interface GetOrdersQueryParams {
  pageNo?: number;
  limit?: number;
  status?: "PENDING" | "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "FAILED";
  type?: "COD" | "PREPAID";
  startDate?: string;
  endDate?: string;
  search?: string;
  keyword?: string;
  priceFrom?: string;
  priceTo?: string;
  fromGovId?: string;
  toGovId?: string;
  fromCityId?: string;
  toCityId?: string;
  shippingPriceFrom?: string;
  shippingPriceTo?: string;
}

/**
 * Response from order actions (return, relist, cancel)
 */
export interface OrderActionResponse {
  status: number;
  message: string;
  data?: unknown;
}

/**
 * Bid information for an order
 */
export interface OrderBid {
  id: string;
  userId: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

/**
 * Response from getting order bids
 * GET /v1/customers/orders/bids/:id
 */
export interface OrderBidsResponse {
  status: number;
  message: string;
  data: OrderBid[];
}

/**
 * Request body for updating a bid
 * PUT /v1/customers/orders/bid/:id
 */
export interface UpdateBidRequest {
  orderId: string;
  status: "ACCEPTED" | "REJECTED";
}

/**
 * Request body for marking order as returned
 * POST /v1/customers/orders/return/:id
 */
export interface MarkAsReturnedRequest {
  hash: string;
}

/**
 * Request body for cancelling courier
 * POST /v1/customers/orders/cancel/:id
 */
export interface CancelCourierRequest {
  reason: string;
}

/**
 * Request body for updating an order
 * PUT /v1/customers/orders/:id
 */
export interface UpdateOrderRequest {
  clientName?: string;
  clientPhone?: string;
  clientOtherPhone?: string;
  clientAddress?: string;
  clientAddressId?: string;
  lat?: number;
  lng?: number;
  gov?: string;
  govId?: string;
  city?: string;
  cityId?: string;
  cash?: number;
  type?: "COD" | "PREPAID";
  notes?: string;
  content?: string;
  attachment?: string;
  requiredSupplierFailedAmount?: number;
}

/**
 * Request body for adjusting order location
 * POST /v1/customers/orders/adjust-location/:id
 */
export interface AdjustLocationRequest {
  lat: number;
  lng: number;
}

/**
 * Request body for updating a single order with new API format
 * PUT /v1/customers/orders/single/:id
 * Body example:
 * {
 *   "name": "Shreif Customer",
 *   "phone": "01114077125",
 *   "address": "1 Asia St, Nile Cornish, Maadi",
 *   "cityId": "UXgOcotYrdYDdXFUA32D",
 *   "govId": "P4u8oppR5537YIFyRwfa",
 *   "pickupId": "Fiut1jxWhn4XjLrvhVVf",
 *   "cash": 100.00,
 *   "fees": 65.00,
 *   "content": "Electronics - TV, Laptop",
 *   "notes": "Leave the package at the front door.",
 *   "type": "COD" // COD, PREPAID
 * }
 */
export interface UpdateSingleOrderRequest {
  name: string;
  phone: string;
  address: string;
  cityId: string;
  govId: string;
  pickupId: string;
  cash: number;
  fees: number;
  content: string;
  notes: string;
  type: "COD" | "PREPAID";
}
