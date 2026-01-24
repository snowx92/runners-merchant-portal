// Re-export UserAddress from address.types.ts
export type { UserAddress } from "./address.types";

/**
 * Request body for creating a new location/address
 * POST /v1/customers/locations
 */
export interface CreateLocationRequest {
  title: string;
  latitude: number;
  longitude: number;
  street: string;
  cityId: string;
  stateId: string;
  phoneNumber: string;
  buildingNumber: string;
  floorNumber: string;
  apartmentNumber: string;
  notes: string;
}

/**
 * Request body for updating a location
 * PUT /v1/customers/locations/:id
 */
export interface UpdateLocationRequest {
  title?: string;
  latitude?: number;
  longitude?: number;
  street?: string;
  city?: string;
  cityId?: string;
  state?: string;
  stateId?: string;
  phoneNumber?: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  notes?: string;
}

/**
 * Response from creating/updating a location
 */
export interface LocationResponse {
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    street: string;
    city?: string;
    cityId?: string;
    state?: string;
    stateId?: string;
    phoneNumber: string;
    defaultAddress?: boolean;
    buildingNumber: string;
    floorNumber: string;
    apartmentNumber: string;
    notes: string;
  };
}

/**
 * Response from getting all locations
 * GET /v1/customers/locations/
 */
export interface LocationsResponse {
  status: number;
  message: string;
  data: LocationResponse["data"][];
}

/**
 * Response from deleting a location
 * DELETE /v1/customers/locations/:id
 */
export interface DeleteLocationResponse {
  status: number;
  message: string;
}
