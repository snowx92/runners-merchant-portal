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
  location: string;
  phone: string;
  governorate: string;
  city: string;
  detailedAddress: string;
}


export const AddAddressModal = ({ isOpen, onClose, onSave, initialData }: AddAddressModalProps) => {
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");

  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);

  // Load zones and set initial data on mount/open
  useEffect(() => {
    if (isOpen) {
      loadZones();
      if (initialData) {
        setLocation(initialData.location);
        setPhone(initialData.phone);
        setGovernorate(initialData.governorate);
        setCity(initialData.city);
        setDetailedAddress(initialData.detailedAddress);
      } else {
        // Reset form
        setLocation("");
        setPhone("");
        setGovernorate("");
        setCity("");
        setDetailedAddress("");
      }
    }
  }, [isOpen, initialData]);

  // Filter cities when governorate changes
  useEffect(() => {
    if (governorate) {
      const selectedZone = zones.find(z => z.id === governorate);
      setFilteredCities(selectedZone?.cities || []);
      setCity(""); // Reset city when governorate changes
    } else {
      setFilteredCities([]);
    }
  }, [governorate, zones]);

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
    if (!location.trim()) {
      alert("يرجى اختيار موقعك");
      return;
    }

    if (!validatePhone(phone)) {
      alert("يرجى إدخال رقم هاتف صحيح (11 رقم يبدأ بـ 01)");
      return;
    }

    if (!governorate) {
      alert("يرجى اختيار المحافظة");
      return;
    }

    if (!city) {
      alert("يرجى اختيار المدينة");
      return;
    }

    if (!detailedAddress.trim()) {
      alert("يرجى إدخال العنوان بالتفصيل");
      return;
    }

    const addressData: AddressData = {
      location,
      phone,
      governorate,
      city,
      detailedAddress,
    };

    onSave(addressData);
    handleCancel();
  };

  const handleCancel = () => {
    // Reset form
    setLocation("");
    setPhone("");
    setGovernorate("");
    setCity("");
    setDetailedAddress("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Header */}
          <h2 className={styles.modalTitle}>{initialData ? "تعديل عنوان" : "إضافة عنوان"}</h2>

          {/* Location Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>اختر موقعك</label>
            <input
              type="text"
              className={styles.input}
              placeholder="اختر موقعك من الخريطة"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!governorate || isLoadingZones}
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

          {/* Detailed Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>العنوان بالتفصيل</label>
            <input
              type="text"
              className={styles.input}
              placeholder="اسم المكان"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
            />
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
