import { ApiService } from "./ApiService";
import type {
  CreateLocationRequest,
  UpdateLocationRequest,
  LocationResponse,
  LocationsResponse,
  DeleteLocationResponse,
} from "../types/location.types";

/**
 * LocationService for managing user addresses/locations
 * Uses ApiService with /v1/customers base URL
 *
 * Endpoints:
 * - GET /locations/ - Get all user locations
 * - POST /locations - Create a new location
 * - PUT /locations/:id - Update a location
 * - DELETE /locations/:id - Delete a location
 * - GET /locations/:id - Get a single location by ID
 */
class LocationService extends ApiService {
  /**
   * Get all user locations
   * GET /v1/customers/locations/
   * @returns All user locations
   */
  async getLocations(): Promise<LocationsResponse | null> {
    const response = await this.get<LocationsResponse>("/locations/");

    if (!response) {
      throw new Error("Failed to fetch locations");
    }

    return response;
  }

  /**
   * Get a single location by ID
   * GET /v1/customers/locations/:id
   * @param locationId Location ID
   * @returns Single location data
   */
  async getSingleLocation(locationId: string): Promise<LocationResponse | null> {
    const response = await this.get<LocationResponse>(`/locations/${locationId}`);

    if (!response) {
      throw new Error("Failed to fetch location");
    }

    return response;
  }

  /**
   * Create a new location
   * POST /v1/customers/locations
   * @param locationData Location data to create
   * @returns Created location data
   */
  async createLocation(locationData: CreateLocationRequest): Promise<LocationResponse | null> {
    const response = await this.post<LocationResponse>("/locations", locationData);

    if (!response) {
      throw new Error("Failed to create location");
    }

    return response;
  }

  /**
   * Update an existing location
   * PUT /v1/customers/locations/:id
   * @param locationId Location ID to update
   * @param locationData Partial location data to update
   * @returns Updated location data
   */
  async updateLocation(
    locationId: string,
    locationData: UpdateLocationRequest
  ): Promise<LocationResponse | null> {
    const response = await this.put<LocationResponse>(`/locations/${locationId}`, locationData);

    if (!response) {
      throw new Error("Failed to update location");
    }

    return response;
  }

  /**
   * Delete a location
   * DELETE /v1/customers/locations/:id
   * @param locationId Location ID to delete
   * @returns Delete confirmation
   */
  async deleteLocation(locationId: string): Promise<DeleteLocationResponse | null> {
    const response = await this.delete<DeleteLocationResponse>(`/locations/${locationId}`);

    if (!response) {
      throw new Error("Failed to delete location");
    }

    return response;
  }
}

export const locationService = new LocationService();
