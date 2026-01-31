/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import styles from "@/styles/profile/addAddressModal.module.css";
import { zoneService } from "@/lib/api/services/zoneService";
import type { Zone, City } from "@/lib/api/types/zone.types";
import { SearchableSelect } from "@/components/common/SearchableSelect";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialData?: AddressData | null;
}

interface AddressData {
  title: string;
  street: string;
  city: string;
  cityId: string;
  state: string;
  stateId: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  defaultAddress: boolean;
  buildingNumber: string;
  floorNumber: string;
  apartmentNumber: string;
  notes: string;
}

export const AddAddressModal = ({ isOpen, onClose, onSave, initialData }: AddAddressModalProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('address');
  const tCommon = useTranslations('common');

  const [title, setTitle] = useState("");
  const [street, setStreet] = useState("");
  const [phone, setPhone] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [defaultAddress, setDefaultAddress] = useState(false);
  const [latitude, setLatitude] = useState(30.0444);
  const [longitude, setLongitude] = useState(31.2357);

  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRefObj = useRef<google.maps.Map | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapInitializedRef = useRef(false);

  // Load Google Maps Script
  const loadGoogleMapsScript = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not found");
      setMapError("Google Maps API key not found");
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      if (window.google) {
        setMapLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setMapLoaded(true));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      setMapError(t('mapLoadError'));
    };
    document.head.appendChild(script);
  };

  // Initialize map (simple approach matching order details page)
  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current || !window.google) return;

    const center = { lat, lng };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapRefObj.current = map;

    // Initialize services after map is created
    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    geocoderRef.current = new google.maps.Geocoder();
    placesServiceRef.current = new google.maps.places.PlacesService(map);

    const marker = new google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
      title: t('deliveryMarker'),
    });

    markerRef.current = marker;

    // Marker drag event
    marker.addListener("dragend", async () => {
      const position = marker.getPosition();
      if (position) {
        const newLat = position.lat();
        const newLng = position.lng();
        setLatitude(newLat);
        setLongitude(newLng);
        await reverseGeocode(newLat, newLng);
      }
    });

    // Map click event to move marker
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        marker.setPosition({ lat: newLat, lng: newLng });
        setLatitude(newLat);
        setLongitude(newLng);
        reverseGeocode(newLat, newLng);
      }
    });

    mapInitializedRef.current = true;

    // If no initial data (new address), try to get user's current location
    if (!initialData && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const userPos = { lat: userLat, lng: userLng };
          map.panTo(userPos);
          marker.setPosition(userPos);
          setLatitude(userLat);
          setLongitude(userLng);
          reverseGeocode(userLat, userLng);
        },
        () => {
          // Geolocation denied or failed - keep default Cairo position
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    try {
      const response = await geocoderRef.current.geocode({
        location: { lat, lng },
      });

      if (response.results[0]) {
        const addressComponents = response.results[0].address_components;
        let streetName = "";
        let buildingNum = "";
        
        for (const component of addressComponents) {
          const types = component.types;
          if (types.includes("route")) {
            streetName = component.long_name;
          }
          if (types.includes("street_number")) {
            buildingNum = component.long_name;
          }
        }

        if (streetName && !street) {
          setStreet(streetName);
        }
        if (buildingNum && !buildingNumber) {
          setBuildingNumber(buildingNum);
        }
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!autocompleteServiceRef.current || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await autocompleteServiceRef.current.getPlacePredictions({
        input: query,
        types: ["address"],
        componentRestrictions: { country: "eg" }, // Egypt only
      });

      if (response.predictions) {
        setSearchResults(response.predictions);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchPlaces(query);
  };

  // Select a place from search results
  const selectPlace = (placeId: string) => {
    if (!placesServiceRef.current || !mapRefObj.current || !markerRef.current) return;

    placesServiceRef.current.getDetails(
      {
        placeId,
        fields: ["geometry", "address_components", "name"],
      },
      async (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const location = place.geometry.location;
          if (!location) return;
          
          const lat = location.lat();
          const lng = location.lng();

          // Update map and marker
          mapRefObj.current?.panTo(location);
          mapRefObj.current?.setZoom(17);
          markerRef.current?.setPosition(location);

          // Update coordinates
          setLatitude(lat);
          setLongitude(lng);

          // Extract address components
          if (place.address_components) {
            let streetName = "";
            let buildingNum = "";
            let city = "";
            let state = "";

            for (const component of place.address_components) {
              const types = component.types;
              if (types.includes("route")) {
                streetName = component.long_name;
              }
              if (types.includes("street_number")) {
                buildingNum = component.long_name;
              }
              if (types.includes("locality")) {
                city = component.long_name;
              }
              if (types.includes("administrative_area_level_1")) {
                state = component.long_name;
              }
            }

            // Try to match city and state with zones
            if (zones.length > 0) {
              const matchedState = zones.find(z => 
                z.name === state || state?.includes(z.name)
              );
              if (matchedState) {
                setStateId(matchedState.id);
                
                const matchedCity = matchedState.cities.find(c => 
                  c.name === city || city?.includes(c.name)
                );
                if (matchedCity) {
                  setCityId(matchedCity.id);
                  setFilteredCities(matchedState.cities);
                }
              }
            }

            setStreet(streetName || place.name || "");
            setBuildingNumber(buildingNum);
          }

          setSearchQuery("");
          setSearchResults([]);
        }
      }
    );
  };

  // Load zones and set initial data on mount/open
  useEffect(() => {
    if (isOpen) {
      // Reset map state for fresh initialization
      mapInitializedRef.current = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRefObj.current = null;
      setMapError(null);

      const loadData = async () => {
        await loadZones();
        if (initialData) {
          setTitle(initialData.title);
          setStreet(initialData.street);
          setPhone(initialData.phoneNumber);
          setStateId(initialData.stateId);
          setCityId(initialData.cityId);
          setBuildingNumber(initialData.buildingNumber);
          setFloorNumber(initialData.floorNumber);
          setApartmentNumber(initialData.apartmentNumber);
          setNotes(initialData.notes);
          setDefaultAddress(initialData.defaultAddress);
          setLatitude(initialData.latitude);
          setLongitude(initialData.longitude);
        } else {
          // Reset form
          setTitle("");
          setStreet("");
          setPhone("");
          setStateId("");
          setCityId("");
          setBuildingNumber("");
          setFloorNumber("");
          setApartmentNumber("");
          setNotes("");
          setDefaultAddress(false);
          setLatitude(30.0444);
          setLongitude(31.2357);
        }
      };
      loadData();

      // Load Google Maps script
      loadGoogleMapsScript();
    }
  }, [isOpen, initialData]);

  // Initialize map when script is loaded and modal is open
  useEffect(() => {
    if (isOpen && mapLoaded && !mapInitializedRef.current) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        if (mapRef.current) {
          const lat = initialData?.latitude ?? latitude;
          const lng = initialData?.longitude ?? longitude;
          initializeMap(lat, lng);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mapLoaded]);

  // Filter cities when state changes
  useEffect(() => {
    if (stateId && zones.length > 0) {
      const selectedZone = zones.find(z => z.id === stateId);
      setFilteredCities(selectedZone?.cities || []);
    } else {
      setFilteredCities([]);
      if (stateId === "") {
        setCityId("");
      }
    }
  }, [stateId, zones]);

  const loadZones = async () => {
    setIsLoadingZones(true);
    try {
      const response = await zoneService.getZones();
      if (response && response.data) {
        setZones(response.data);
      }
    } catch (error) {
      console.error("Error loading zones:", error);
      alert(t('loadZonesFailed'));
    } finally {
      setIsLoadingZones(false);
    }
  };

  const retryLoadMap = () => {
    setMapError(null);
    setMapLoaded(false);
    mapInitializedRef.current = false;
    mapRefObj.current = null;
    markerRef.current = null;
    autocompleteServiceRef.current = null;
    placesServiceRef.current = null;
    geocoderRef.current = null;
    // Remove existing script and reload
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.remove();
    }
    // Re-trigger script loading
    loadGoogleMapsScript();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numbers = value.replace(/\D/g, "");

    // Limit to 11 digits
    if (numbers.length <= 11) {
      setPhone(numbers);
    }
  };

  const validatePhone = (phoneNumber: string): boolean => {
    // Must be exactly 11 digits and start with 01
    return phoneNumber.length === 11 && phoneNumber.startsWith("01");
  };

  const handleSave = () => {
    // Validation
    if (!title.trim()) {
      alert(t('validation.titleRequired'));
      return;
    }

    if (!validatePhone(phone)) {
      alert(t('validation.phoneInvalid'));
      return;
    }

    if (!stateId) {
      alert(t('validation.governorateRequired'));
      return;
    }

    if (!cityId) {
      alert(t('validation.cityRequired'));
      return;
    }

    if (!street.trim()) {
      alert(t('validation.streetRequired'));
      return;
    }

    // Get the state and city names
    const selectedZone = zones.find(z => z.id === stateId);
    const selectedCity = filteredCities.find(c => c.id === cityId);

    const addressData: AddressData = {
      title,
      street,
      city: selectedCity?.name || "",
      cityId,
      state: selectedZone?.name || "",
      stateId,
      phoneNumber: phone,
      latitude,
      longitude,
      defaultAddress,
      buildingNumber,
      floorNumber,
      apartmentNumber,
      notes,
    };

    onSave(addressData);
    handleCancel();
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setStreet("");
    setPhone("");
    setStateId("");
    setCityId("");
    setBuildingNumber("");
    setFloorNumber("");
    setApartmentNumber("");
    setNotes("");
    setDefaultAddress(false);
    setLatitude(30.0444);
    setLongitude(31.2357);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.modalContent}>
          {/* Header */}
          <h2 className={styles.modalTitle}>{initialData ? t('editTitle') : t('addTitle')}</h2>

          {/* Title Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('locationTitle')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('locationTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Phone Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('phone')}</label>
            <input
              type="tel"
              className={styles.input}
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
            />
            {phone.length > 0 && !validatePhone(phone) && (
              <p className={styles.errorText}>
                {phone.length !== 11 ? t('phoneValidation.mustBe11Digits') : t('phoneValidation.mustStartWith01')}
              </p>
            )}
          </div>

          {/* Map */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('deliveryLocation')}</label>
            <div className={styles.mapContainer}>
              {!mapLoaded && !mapError && (
                <div className={styles.mapLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <p>{t('loadingMap')}</p>
                </div>
              )}
              {mapError && (
                <div className={styles.mapError}>
                  <p>{mapError}</p>
                  <button className={styles.retryButton} onClick={retryLoadMap}>
                    {t('retry')}
                  </button>
                </div>
              )}
              <div ref={mapRef} style={{ width: '100%', height: '100%', display: mapLoaded && !mapError ? 'block' : 'none' }}></div>
            </div>
          </div>

          {/* Governorate and City */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('governorate')}</label>
              <SearchableSelect
                options={zones}
                value={stateId}
                onChange={(id) => setStateId(id)}
                placeholder={t('governorate')}
                disabled={isLoadingZones}
              />
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('city')}</label>
              <SearchableSelect
                options={filteredCities}
                value={cityId}
                onChange={(id) => setCityId(id)}
                placeholder={t('city')}
                disabled={!stateId || isLoadingZones}
              />
            </div>
          </div>

          {/* Street */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('street')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('streetPlaceholder')}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          {/* Building, Floor, Apartment */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('building')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('building')}
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
              />
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('floor')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('floor')}
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('apartment')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('apartment')}
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('notes')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Default Address Checkbox */}
          <div className={styles.formGroup}>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              {t('cancel')}
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              {tCommon('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface UserAddress {
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
  buildingNumber: string;
  floorNumber: string;
  apartmentNumber: string;
  notes: string;
}

