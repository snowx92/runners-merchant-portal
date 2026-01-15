import { CommonApiService } from "./CommonApiService";
import type { ZonesResponse } from "../types/zone.types";

/**
 * ZoneService for fetching governorates and cities
 * Uses CommonApiService for /v1/common/zones endpoint
 */
class ZoneService extends CommonApiService {
  /**
   * Get all zones (governorates) with their cities
   * GET /v1/common/zones
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
