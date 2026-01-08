"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/bulk.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { name: "مصر", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "السعودية", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "الإمارات", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "الكويت", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "قطر", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "البحرين", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "الأردن", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "لبنان", code: "LB", dialCode: "+961", flag: "🇱🇧" },
];

interface BulkOrder {
  id: number;
  clientName: string;
  phone: string;
  city: string;
  neighborhood: string;
  address: string;
  packageDescription: string;
  packagePrice: number;
  deliveryPrice: number;
  image: string | null;
  notes: string;
  isEditing: boolean;
}

export default function BulkOrder() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState<{[key: number]: boolean}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedOrders: BulkOrder[] = (jsonData as Record<string, unknown>[]).map((row, index) => ({
        id: index + 1,
        clientName: String(row["اسم العميل"] || row["Client Name"] || ""),
        phone: String(row["رقم الهاتف"] || row["Phone"] || ""),
        city: String(row["المدينة"] || row["City"] || ""),
        neighborhood: String(row["الحي"] || row["Neighborhood"] || ""),
        address: String(row["العنوان"] || row["Address"] || ""),
        packageDescription: String(row["وصف الشحنة"] || row["Package Description"] || ""),
        packagePrice: parseFloat(String(row["سعر الشحنة"] || row["Package Price"] || "50")),
        deliveryPrice: parseFloat(String(row["سعر التوصيل"] || row["Delivery Price"] || "50")),
        image: null,
        notes: String(row["ملاحظات"] || row["Notes"] || ""),
        isEditing: false,
      }));

      setOrders(parsedOrders);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      parseExcelFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      parseExcelFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditOrder = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isEditing: true } : order
      )
    );
  };

  const handleCancelEdit = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isEditing: false } : order
      )
    );
  };

  const handleOrderChange = (orderId: number, field: keyof BulkOrder, value: string | number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      )
    );
  };

  const handleImageUpload = (orderId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, image: imageData } : order
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, image: null } : order
      )
    );
  };

  const toggleCountryDropdown = (orderId: number) => {
    setShowCountryDropdown((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCountrySelect = (orderId: number, country: Country) => {
    setSelectedCountry(country);
    setShowCountryDropdown((prev) => ({
      ...prev,
      [orderId]: false,
    }));
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.backArrow} onClick={() => router.back()}>
            →
          </span>
          <h1 className={styles.pageTitle}>انشاء طلب مجمع</h1>
          <button className={styles.confirmButton}>

            تأكيد الطلب
          </button>
        </div>

        {/* Upload Card or Orders List */}
        {orders.length === 0 ? (
          <div className={styles.uploadCard}>
            <h2 className={styles.cardTitle}>وصف الشحنة (اختياري)</h2>

            <div
              className={styles.uploadArea}
              onClick={handleUploadClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <div className={styles.uploadContent}>
                <div className={styles.uploadIcon}>
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M52.5 37.5V47.5C52.5 48.8261 51.9732 50.0979 51.0355 51.0355C50.0979 51.9732 48.8261 52.5 47.5 52.5H12.5C11.1739 52.5 9.90215 51.9732 8.96447 51.0355C8.02678 50.0979 7.5 48.8261 7.5 47.5V37.5"
                      stroke="#999"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M42.5 20L30 7.5L17.5 20"
                      stroke="#999"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M30 7.5V37.5"
                      stroke="#999"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {uploadedFile ? (
                  <div className={styles.fileInfo}>
                    <p className={styles.fileName}>{uploadedFile.name}</p>
                    <p className={styles.fileSize}>
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <p className={styles.uploadText}>قم برفع ملف Excel هنا</p>
                )}
              </div>
            </div>

            <p className={styles.uploadHint}>
              يجب ان يحتوي الملف على المعلومات الاساسية لكل طلب{" "}
              <span className={styles.downloadLink}>تحميل ملف ارشادي</span>
            </p>
          </div>
        ) : (
          <div className={styles.ordersListContainer}>
            {orders.map((order) => (
              <div key={order.id}>
                {order.isEditing ? (
                  <div className={styles.formCard}>
                    <div className={styles.formHeader}>
                      <div className={styles.formHeaderActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={() => handleCancelEdit(order.id)}
                        >
                          إلغاء
                        </button>
                        <button
                          className={styles.saveButton}
                          onClick={() => handleCancelEdit(order.id)}
                        >
                          حفظ التعديلات
                        </button>
                      </div>
                      <h3 className={styles.formHeaderTitle}>تعديل الطلب</h3>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        وصف الشحنة
                        <textarea
                          className={styles.textarea}
                          placeholder="ادخل وصف الشحنة هنا"
                          rows={4}
                          value={order.packageDescription}
                          onChange={(e) => handleOrderChange(order.id, "packageDescription", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className={styles.formRow}>
                      <label className={styles.label}>
                        سعر الشحنة
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ادخل سعر الشحنة هنا"
                          value={order.packagePrice}
                          onChange={(e) => handleOrderChange(order.id, "packagePrice", parseFloat(e.target.value) || 0)}
                        />
                      </label>
                      <label className={styles.label}>
                        سعر التوصيل
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ادخل سعر التوصيل هنا"
                          value={order.deliveryPrice}
                          onChange={(e) => handleOrderChange(order.id, "deliveryPrice", parseFloat(e.target.value) || 0)}
                        />
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        صورة الشحنة (اختياري)
                        <div className={styles.imageUploadContainer}>
                          {order.image ? (
                            <div className={styles.imagePreview}>
                              <img src={order.image} alt="Package" className={styles.previewImage} />
                              <button
                                className={styles.removeImageBtn}
                                onClick={() => handleRemoveImage(order.id)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div
                              className={styles.uploadBox}
                              onClick={() => orderFileInputRefs.current[order.id]?.click()}
                            >
                              <span className={styles.uploadIcon}>📷</span>
                              <p className={styles.uploadText}>قم برفع صورة PNG،JPG بحد اقصى 2MB</p>
                              <input
                                ref={(el) => {
                                  if (el) orderFileInputRefs.current[order.id] = el;
                                }}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(order.id, e)}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        عنوان الاستلام
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.select}
                            value={order.address}
                            onChange={(e) => handleOrderChange(order.id, "address", e.target.value)}
                          >
                            <option value="">اختر عنوان الاستلام</option>
                            <option value="شارع السعادة مدينة الرحمن">شارع السعادة مدينة الرحمن</option>
                          </select>
                        </div>
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        اسم العميل
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ادخل اسم العميل هنا"
                          value={order.clientName}
                          onChange={(e) => handleOrderChange(order.id, "clientName", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        رقم هاتف العميل
                        <div className={styles.phoneInputWrapper}>
                          <input
                            type="tel"
                            className={styles.phoneInputField}
                            placeholder="ادخل رقم هاتف هنا"
                            value={order.phone}
                            onChange={(e) => handleOrderChange(order.id, "phone", e.target.value)}
                          />
                          <div className={styles.countryCodeWrapper}>
                            <button
                              type="button"
                              className={styles.countryCodeButton}
                              onClick={() => toggleCountryDropdown(order.id)}
                            >
                              <span className={styles.flag}>{selectedCountry.flag}</span>
                              <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
                              <span className={styles.dropdownArrow}>▼</span>
                            </button>
                            {showCountryDropdown[order.id] && (
                              <div className={styles.countryDropdown}>
                                {countries.map((country) => (
                                  <div
                                    key={country.code}
                                    className={styles.countryOption}
                                    onClick={() => handleCountrySelect(order.id, country)}
                                  >
                                    <span className={styles.flag}>{country.flag}</span>
                                    <span className={styles.countryName}>{country.name}</span>
                                    <span className={styles.dialCode}>{country.dialCode}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        عنوان العميل
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ادخل عنوان العميل هنا"
                          value={order.address}
                          onChange={(e) => handleOrderChange(order.id, "address", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        المدينة
                        <div className={styles.selectWrapper}>
                          <select
                            className={styles.select}
                            value={order.city}
                            onChange={(e) => handleOrderChange(order.id, "city", e.target.value)}
                          >
                            <option value="">اختر المدينة</option>
                            <option value="القاهرة">القاهرة</option>
                          </select>
                        </div>
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        الملاحظات
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="ادخل الملاحظات هنا"
                          value={order.notes}
                          onChange={(e) => handleOrderChange(order.id, "notes", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className={styles.orderRow}>
                    <div className={styles.clientSection}>
                      <span className={styles.sectionTitle}>اسم العميل: {order.clientName}</span>
                      <span className={styles.sectionContent}>الهاتف: {order.phone}</span>
                    </div>

                    <div className={styles.locationSection}>
                      <span className={styles.sectionTitle}>المدينة، {order.city}</span>
                      <span className={styles.sectionContent}>
                        العنوان: {order.address}
                      </span>
                    </div>

                    <div className={styles.descriptionSection}>
                      <span className={styles.sectionTitle}>وصف الشحنة</span>
                      <span className={styles.sectionContent}>{order.packageDescription}</span>
                    </div>

                    <div className={styles.priceSection}>
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>سعر الشحنة</span>
                        <span className={styles.priceValue}>{order.packagePrice} جنيه</span>
                      </div>
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>سعر التوصيل</span>
                        <span className={styles.priceValue}>{order.deliveryPrice} جنيه</span>
                      </div>
                    </div>

                    <button
                      className={styles.editButton}
                      onClick={() => handleEditOrder(order.id)}
                    >
                      تعديل الطلب
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
