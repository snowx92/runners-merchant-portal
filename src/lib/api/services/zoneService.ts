import { CommonApiService } from "./CommonApiService";
import type { ZonesResponse } from "../types/zone.types";

/**
 * ZoneService for fetching governorates and cities
 * Uses CommonApiService for /v1/common/zones endpoint
 * Language is handled via the API header set by ApiService
 */
class ZoneService extends CommonApiService {
  /**
   * Get all zones (governorates) with their cities
   * GET /v1/common/zones
   * Language is determined by the current locale in ApiService headers
   */
  async getZones(): Promise<ZonesResponse | null> {
    const response = await this.get<ZonesResponse>("/common/zones");

    if (!response) {
      throw new Error("Failed to fetch zones");
    }

    return response;
  }
}

export const zoneService = new ZoneService();
