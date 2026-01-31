/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Google Maps Type Declarations
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
    fcWidget: {
      init: (options: any) => void;
      open: () => void;
    };
  }

  namespace google {
    namespace maps {
      // Animation
      const Animation: {
        DROP: number;
        BOUNCE: number;
      };

      // PlacesServiceStatus
      const PlacesServiceStatus: {
        OK: string;
        ZERO_RESULTS: string;
        OVER_QUERY_LIMIT: string;
        REQUEST_DENIED: string;
        INVALID_REQUEST: string;
        UNKNOWN_ERROR: string;
      };

      // Map class
      class Map {
        constructor(element: HTMLElement, options: MapOptions);
        setCenter(latLng: LatLngLiteral): void;
        getCenter(): LatLng | undefined;
        setZoom(zoom: number): void;
        getZoom(): number | undefined;
        panTo(latLng: LatLngLiteral | LatLng): void;
        addListener(eventName: string, handler: (event: MapMouseEvent) => void): void;
      }

      // Marker class
      class Marker {
        constructor(options: MarkerOptions);
        setPosition(latLng: LatLngLiteral | LatLng): void;
        getPosition(): LatLng | undefined;
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setDraggable(draggable: boolean): void;
        getDraggable(): boolean;
        setTitle(title: string): void;
        getTitle(): string | undefined;
        setAnimation(animation: number): void;
        addListener(eventName: string, handler: (event: MapMouseEvent) => void): void;
      }

      // LatLng class
      class LatLng {
        lat(): number;
        lng(): number;
      }

      // LatLngLiteral interface
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      // MapOptions interface
      interface MapOptions {
        center?: LatLngLiteral;
        zoom?: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
        mapTypeId?: string;
      }

      // MarkerOptions interface
      interface MarkerOptions {
        position: LatLngLiteral | LatLng;
        map?: Map | null;
        draggable?: boolean;
        title?: string;
        animation?: number;
      }

      // MapMouseEvent interface
      interface MapMouseEvent {
        latLng: LatLng | null;
        stop(): void;
      }

      namespace places {
        // AutocompleteService class
        class AutocompleteService {
          getPlacePredictions(
            request: AutocompleteRequest
          ): Promise<AutocompleteResponse>;
        }

        // AutocompleteRequest interface
        interface AutocompleteRequest {
          input: string;
          types?: string[];
          componentRestrictions?: ComponentRestrictions;
        }

        // ComponentRestrictions interface
        interface ComponentRestrictions {
          country: string | string[];
        }

        // AutocompleteResponse interface
        interface AutocompleteResponse {
          predictions: AutocompletePrediction[];
          status: string;
        }

        // AutocompletePrediction interface
        interface AutocompletePrediction {
          description: string;
          place_id: string;
          structured_formatting: {
            main_text: string;
            secondary_text: string;
          };
          types: string[];
        }

        // PlacesService class
        class PlacesService {
          constructor(attrContainer: HTMLElement);
          getDetails(
            request: PlaceDetailsRequest,
            callback: (
              place: PlaceDetails | null,
              status: string
            ) => void
          ): void;
        }

        // PlaceDetailsRequest interface
        interface PlaceDetailsRequest {
          placeId: string;
          fields: string[];
        }

        // PlaceDetails interface
        interface PlaceDetails {
          geometry?: {
            location: LatLng;
            viewport?: {
              getNorthEast(): LatLng;
              getSouthWest(): LatLng;
            };
          };
          address_components?: AddressComponent[];
          name?: string;
          formatted_address?: string;
          place_id?: string;
        }

        // AddressComponent interface
        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        // PlacesServiceStatus
        const PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          INVALID_REQUEST: string;
          UNKNOWN_ERROR: string;
        };
      }

      namespace Geocoder {
        interface GeocoderResult {
          address_components: GeocoderAddressComponent[];
          formatted_address: string;
          geometry: {
            location: LatLng;
            viewport: {
              getNorthEast(): LatLng;
              getSouthWest(): LatLng;
            };
          };
          place_id: string;
          types: string[];
        }

        interface GeocoderAddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        interface GeocoderRequest {
          location?: LatLngLiteral | LatLng;
          address?: string;
          placeId?: string;
        }

        interface GeocoderResponse {
          results: GeocoderResult[];
          status: string;
        }
      }

      class Geocoder {
        geocode(
          request: Geocoder.GeocoderRequest
        ): Promise<Geocoder.GeocoderResponse>;
      }
    }
  }
}

export { };

