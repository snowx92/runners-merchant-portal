/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Google Maps Type Declarations
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: MapOptions);
        setCenter(latLng: LatLngLiteral): void;
        getCenter(): LatLng | undefined;
        setZoom(zoom: number): void;
        getZoom(): number | undefined;
      }

      class Marker {
        constructor(options: MarkerOptions);
        setPosition(latLng: LatLngLiteral | LatLng): void;
        getPosition(): LatLng | undefined;
        setMap(map: Map | null): void;
        getMap(): Map | null;
        setDraggable(draggable: boolean): void;
        getDraggable(): boolean;
        addListener(eventName: string, handler: (event: MapMouseEvent) => void): void;
      }

      class LatLng {
        lat(): number;
        lng(): number;
      }

      class LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface MapOptions {
        center?: LatLngLiteral;
        zoom?: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
      }

      interface MarkerOptions {
        position: LatLngLiteral | LatLng;
        map?: Map | null;
        draggable?: boolean;
        title?: string;
      }

      interface MapMouseEvent {
        latLng: LatLng | null;
        stop(): void;
      }
    }
  }
}

export {};

