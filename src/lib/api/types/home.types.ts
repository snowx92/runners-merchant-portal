export interface HomeAnalytics {
  currentOrders: number;
  finishedOrders: number;
  netprofit: number;
}

export interface Banner {
  id: string;
  image: string;
  route: string;
}

export interface OrderCustomer {
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
}

export interface OrderPickup {
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
}

export interface OrderCourier {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  method: string;
  rating: number;
  verified: boolean;
  successCount: number;
}

export interface Order {
  id: string;
  qrCode: string;
  cash: number;
  type: "COD" | "PREPAID";
  shippingAmount: number;
  otp: string | null;
  receiveOTP: string;
  courierShippingAmount: number;
  status: "PENDING" | "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "FAILED";
  cashStatus: "PENDING" | "PAID" | "REFUNDED";
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
  selectedCourier: OrderCourier | null;
  pickup: OrderPickup;
  failedInfo: unknown | null;
  customer: OrderCustomer;
}

export interface OrdersResponse {
  items: Order[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
  docsReaded: number;
}
