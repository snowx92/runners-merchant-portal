"use client";

import { useState, useEffect } from "react";
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
      alert("فشل تحميل المحافظات والمدن. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoadingZones(false);
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
      alert("يرجى إدخال عنوان الموقع");
      return;
    }

    if (!validatePhone(phone)) {
      alert("يرجى إدخال رقم هاتف صحيح (11 رقم يبدأ بـ 01)");
      return;
    }

    if (!stateId) {
      alert("يرجى اختيار المحافظة");
      return;
    }

    if (!cityId) {
      alert("يرجى اختيار المدينة");
      return;
    }

    if (!street.trim()) {
      alert("يرجى إدخال الشارع");
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Header */}
          <h2 className={styles.modalTitle}>{initialData ? "تعديل عنوان" : "إضافة عنوان"}</h2>

          {/* Title Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>عنوان الموقع</label>
            <input
              type="text"
              className={styles.input}
              placeholder="مثال: المنزل، العمل، إلخ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Phone Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>رقم الهاتف</label>
            <input
              type="tel"
              className={styles.input}
              placeholder="ادخل رقم الهاتف"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
            />
            {phone.length > 0 && !validatePhone(phone) && (
              <p className={styles.errorText}>
                {phone.length !== 11 ? "يجب أن يكون الرقم 11 رقم" : "يجب أن يبدأ الرقم بـ 01"}
              </p>
            )}
          </div>

          {/* Governorate and City */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>المحافظة</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  disabled={isLoadingZones}
                >
                  <option value="">المحافظة</option>
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
              <label className={styles.label}>المدينة</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  disabled={!stateId || isLoadingZones}
                >
                  <option value="">المدينة</option>
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
            <label className={styles.label}>الشارع</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أدخل اسم الشارع"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          {/* Building, Floor, Apartment */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>رقم العمارة</label>
              <input
                type="text"
                className={styles.input}
                placeholder="رقم العمارة"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
              />
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>رقم الدور</label>
              <input
                type="text"
                className={styles.input}
                placeholder="رقم الدور"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>رقم الشقة</label>
            <input
              type="text"
              className={styles.input}
              placeholder="رقم الشقة"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>ملاحظات إضافية</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أي ملاحظات تساعد في الوصول"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Default Address Checkbox */}
          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={defaultAddress}
                onChange={(e) => setDefaultAddress(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span className={styles.label} style={{ margin: 0 }}>تعيين كعنوان افتراضي</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              رجوع
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
