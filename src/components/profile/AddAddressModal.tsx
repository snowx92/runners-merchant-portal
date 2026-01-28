/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import styles from "@/styles/profile/addAddressModal.module.css";
import { zoneService } from "@/lib/api/services/zoneService";
import type { Zone, City } from "@/lib/api/types/zone.types";

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
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRefObj = useRef<google.maps.Map | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Load Google Maps Script
  useEffect(() => {
    if (!isOpen) return;

    const loadGoogleMapsScript = () => {
      if (window.google) {
        setGoogleMapsLoaded(true);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key not found");
        return;
      }

      // Check if script is already loading or loaded
      const existingScript = document.querySelector(`script[src*="${apiKey}"]`);
      if (existingScript) {
        if (window.google) {
          setGoogleMapsLoaded(true);
        } else {
          existingScript.addEventListener('load', () => setGoogleMapsLoaded(true));
        }
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
      script.async = true;
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        setGoogleMapsLoaded(true);
      };
      script.onerror = (error) => {
        console.error("Failed to load Google Maps script:", error);
        setGoogleMapsLoaded(false);
        setMapError(t('mapLoadError'));
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [isOpen]);

  // Initialize Google Maps
  const initGoogleMaps = useCallback(() => {
    if (!mapRef.current || !window.google || !googleMapsLoaded) return;

    // Prevent multiple initializations
    if (mapRefObj.current) return;

    try {
      const google = window.google;

      // Initialize services
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      placesServiceRef.current = new google.maps.places.PlacesService(mapRef.current);

      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeId: "roadmap",
      });

      mapRefObj.current = map;

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        draggable: true,
        title: t('deliveryMarker'),
        animation: google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Marker drag event
      marker.addListener("dragend", async () => {
        const position = marker.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          setLatitude(lat);
          setLongitude(lng);
          await reverseGeocode(lat, lng);
        }
      });

      // Map click event to move marker
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          marker.setPosition({ lat, lng });
          setLatitude(lat);
          setLongitude(lng);
          reverseGeocode(lat, lng);
        }
      });

      console.log("Google Maps initialized successfully");

    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setGoogleMapsLoaded(false);
    }
  }, [latitude, longitude, googleMapsLoaded]);

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
  const searchPlaces = useCallback(async (query: string) => {
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
  }, []);

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
    }
  }, [isOpen, initialData]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isOpen && googleMapsLoaded && mapRef.current && !mapRefObj.current) {
      // Use requestAnimationFrame for better timing
      const initMap = () => {
        requestAnimationFrame(() => {
          initGoogleMaps();
        });
      };

      // Small delay to ensure DOM is ready
      const timer = setTimeout(initMap, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, googleMapsLoaded, initGoogleMaps]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clean up map and marker references
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapRefObj.current) {
        // Google Maps doesn't have a destroy method, but we can clear references
        mapRefObj.current = null;
      }
      setGoogleMapsLoaded(false);
      setMapError(null);
    }
  }, [isOpen]);

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
    setGoogleMapsLoaded(false);
    // Re-trigger the script loading
    if (isOpen) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const existingScript = document.querySelector(`script[src*="${apiKey}"]`);
        if (existingScript) {
          existingScript.remove();
        }
      }
      // Reset refs
      mapRefObj.current = null;
      markerRef.current = null;
      autocompleteServiceRef.current = null;
      placesServiceRef.current = null;
      geocoderRef.current = null;
    }
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

          {/* Location Search */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('searchLocation')}</label>
            <div className={styles.searchWrapper}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {isSearching && <span className={styles.searchLoading}>⏳</span>}
            </div>
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((result) => (
                  <div
                    key={result.place_id}
                    className={styles.searchResultItem}
                    onClick={() => selectPlace(result.place_id)}
                  >
                    {result.structured_formatting.main_text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('deliveryLocation')}</label>
            <div className={styles.mapContainer}>
              {!googleMapsLoaded && !mapError && (
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
              <div ref={mapRef} style={{ width: '100%', height: '100%', display: googleMapsLoaded && !mapError ? 'block' : 'none' }}></div>
            </div>
            <div className={styles.coordinatesDisplay}>
              <span>lat: {latitude.toFixed(6)}, lng: {longitude.toFixed(6)}</span>
            </div>
          </div>

          {/* Governorate and City */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('governorate')}</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  disabled={isLoadingZones}
                >
                  <option value="">{t('governorate')}</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <svg
                  className={styles.selectIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>{t('city')}</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  disabled={!stateId || isLoadingZones}
                >
                  <option value="">{t('city')}</option>
                  {filteredCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <svg
                  className={styles.selectIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
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

