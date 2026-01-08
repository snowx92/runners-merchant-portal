"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/addOrder.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

interface OrderForm {
  id: number;
  packageDescription: string;
  packagePrice: string;
  deliveryPrice: string;
  recipientAddress: string;
  recipientName: string;
  recipientPhone: string;
  clientAddress: string;
  city: string;
  notes: string;
  image: string | null;
  isCollapsed: boolean;
}

export default function AddOrder() {
  const router = useRouter();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [orders, setOrders] = useState<OrderForm[]>([
    {
      id: 1,
      packageDescription: "",
      packagePrice: "",
      deliveryPrice: "",
      recipientAddress: "",
      recipientName: "",
      recipientPhone: "",
      clientAddress: "",
      city: "",
      notes: "",
      image: null,
      isCollapsed: false,
    },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateOrder = (order: OrderForm, orderId: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!order.packageDescription.trim()) {
      newErrors[`${orderId}_packageDescription`] = "وصف الشحنة مطلوب";
    }
    if (!order.packagePrice.trim() || isNaN(Number(order.packagePrice))) {
      newErrors[`${orderId}_packagePrice`] = "سعر الشحنة مطلوب ويجب أن يكون رقماً";
    }
    if (!order.deliveryPrice.trim() || isNaN(Number(order.deliveryPrice))) {
      newErrors[`${orderId}_deliveryPrice`] = "سعر التوصيل مطلوب ويجب أن يكون رقماً";
    }
    if (!order.recipientAddress.trim()) {
      newErrors[`${orderId}_recipientAddress`] = "عنوان المستلم مطلوب";
    }
    if (!order.recipientName.trim()) {
      newErrors[`${orderId}_recipientName`] = "اسم المستلم مطلوب";
    }
    if (!order.recipientPhone.trim()) {
      newErrors[`${orderId}_recipientPhone`] = "رقم الهاتف مطلوب";
    } else if (!/^\d{11}$/.test(order.recipientPhone)) {
      newErrors[`${orderId}_recipientPhone`] = "رقم الهاتف يجب أن يكون 11 رقماً";
    }
    if (!order.clientAddress.trim()) {
      newErrors[`${orderId}_clientAddress`] = "عنوان العميل مطلوب";
    }
    if (!order.city.trim()) {
      newErrors[`${orderId}_city`] = "المدينة مطلوبة";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: number) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateOrder(orderId, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (orderId: number) => {
    updateOrder(orderId, "image", null);
  };

  const updateOrder = (orderId: number, field: keyof OrderForm, value: any) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      )
    );
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${orderId}_${field}`];
      return newErrors;
    });
  };

  const handleAddAnotherOrder = () => {
    let allValid = true;
    orders.forEach((order) => {
      if (!validateOrder(order, order.id)) {
        allValid = false;
      }
    });

    if (allValid) {
      setOrders((prev) =>
        prev.map((order) => ({ ...order, isCollapsed: true }))
      );
      setOrders((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          packageDescription: "",
          packagePrice: "",
          deliveryPrice: "",
          recipientAddress: "",
          recipientName: "",
          recipientPhone: "",
          clientAddress: "",
          city: "",
          notes: "",
          image: null,
          isCollapsed: false,
        },
      ]);
    }
  };

  const handleConfirmOrder = () => {
    let allValid = true;
    orders.forEach((order) => {
      if (!validateOrder(order, order.id)) {
        allValid = false;
      }
    });

    if (allValid) {
      router.push("/orders");
    }
  };

  const toggleOrderCollapse = (orderId: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isCollapsed: !order.isCollapsed } : order
      )
    );
  };

  const deleteOrder = (orderId: number) => {
    if (orders.length > 1) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const renderOrderForm = (order: OrderForm) => (
    <div key={order.id} className={styles.orderFormWrapper}>
      {order.isCollapsed ? (
        <div className={styles.collapsedOrder}>
          <div className={styles.collapsedContent} onClick={() => toggleOrderCollapse(order.id)}>
            <span className={styles.orderNumber}>{order.id}</span>
            <div className={styles.collapsedInfo}>
              <span className={styles.collapsedTitle}>
                اسم العميل: {order.recipientName || "أحمد محمد"}    وصف الشحنة: {order.packageDescription.substring(0, 30) || "وصف الشحنة هنا"}
              </span>
            </div>
          </div>
          <div className={styles.collapsedActions}>
            {orders.length > 1 && order.id !== 1 && (
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOrder(order.id);
                }}
              >
                ✕
              </button>
            )}
            <div className={styles.collapseIcon} onClick={() => toggleOrderCollapse(order.id)}>
              <Image src="/icons/Chevron down.svg" alt="Expand" width={24} height={24} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.formCard}>
          {orders.length > 1 && (
            <div className={styles.orderHeader}>
              <div className={styles.orderHeaderActions}>
                {order.id !== 1 && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteOrder(order.id)}
                  >
                    ✕
                  </button>
                )}
                <div
                  className={styles.collapseButton}
                  onClick={() => toggleOrderCollapse(order.id)}
                >
                  <Image
                    src="/icons/Chevron down.svg"
                    alt="Collapse"
                    width={24}
                    height={24}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                </div>
              </div>
              <div className={styles.orderHeaderInfo}>
                <span className={styles.orderNumber}>{order.id}</span>
                <span className={styles.orderHeaderTitle}>وصف الشحنة</span>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>وصف الشحنة</label>
            <textarea
              className={`${styles.textarea} ${errors[`${order.id}_packageDescription`] ? styles.inputError : ""}`}
              placeholder="ادخل وصف الشحنة هنا"
              rows={4}
              value={order.packageDescription}
              onChange={(e) => updateOrder(order.id, "packageDescription", e.target.value)}
            />
            {errors[`${order.id}_packageDescription`] && (
              <span className={styles.errorText}>{errors[`${order.id}_packageDescription`]}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>سعر التوصيل</label>
              <input
                type="text"
                className={`${styles.input} ${errors[`${order.id}_deliveryPrice`] ? styles.inputError : ""}`}
                placeholder="ادخل سعر التوصيل"
                value={order.deliveryPrice}
                onChange={(e) => updateOrder(order.id, "deliveryPrice", e.target.value)}
              />
              {errors[`${order.id}_deliveryPrice`] && (
                <span className={styles.errorText}>{errors[`${order.id}_deliveryPrice`]}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>سعر الشحنة</label>
              <input
                type="text"
                className={`${styles.input} ${errors[`${order.id}_packagePrice`] ? styles.inputError : ""}`}
                placeholder="ادخل سعر الشحنة"
                value={order.packagePrice}
                onChange={(e) => updateOrder(order.id, "packagePrice", e.target.value)}
              />
              {errors[`${order.id}_packagePrice`] && (
                <span className={styles.errorText}>{errors[`${order.id}_packagePrice`]}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>صورة الشحنة (اختياري)</label>
            <input
              ref={(el) => (fileInputRefs.current[order.id] = el)}
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => handleImageUpload(e, order.id)}
              style={{ display: "none" }}
            />
            {order.image ? (
              <div className={styles.imagePreview}>
                <Image
                  src={order.image}
                  alt="Package preview"
                  width={400}
                  height={300}
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={() => removeImage(order.id)}
                  className={styles.removeImageBtn}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={styles.uploadBox}
                onClick={() => fileInputRefs.current[order.id]?.click()}
              >
                <div className={styles.uploadIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path
                      d="M24 16V32M16 24H32"
                      stroke="#999"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="24" r="20" stroke="#999" strokeWidth="2" />
                  </svg>
                </div>
                <p className={styles.uploadText}>قم برفع صور للطلب هنا بصيغة PNG,JPG</p>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>عنوان المستلم</label>
            <div className={styles.selectWrapper}>
              <select
                className={`${styles.select} ${errors[`${order.id}_recipientAddress`] ? styles.inputError : ""}`}
                value={order.recipientAddress}
                onChange={(e) => updateOrder(order.id, "recipientAddress", e.target.value)}
              >
                <option value="">اختر العنوان</option>
                <option value="القاهرة، شارع الأزهر">القاهرة، شارع الأزهر</option>
              </select>
              <span className={styles.selectArrow}>›</span>
            </div>
            {errors[`${order.id}_recipientAddress`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientAddress`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>اسم المستلم</label>
            <input
              type="text"
              className={`${styles.input} ${errors[`${order.id}_recipientName`] ? styles.inputError : ""}`}
              placeholder="ادخل اسم المستلم هنا"
              value={order.recipientName}
              onChange={(e) => updateOrder(order.id, "recipientName", e.target.value)}
            />
            {errors[`${order.id}_recipientName`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientName`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>رقم هاتف المستلم</label>
            <div className={styles.phoneInputWrapper}>
              <input
                type="text"
                className={`${styles.phoneInputField} ${errors[`${order.id}_recipientPhone`] ? styles.inputError : ""}`}
                placeholder="ادخل رقم الهاتف"
                value={order.recipientPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    updateOrder(order.id, "recipientPhone", value);
                  }
                }}
                maxLength={11}
              />
              <div className={styles.countryCodeWrapper}>
                <div
                  className={styles.countryCodeButton}
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <span className={styles.flag}>{selectedCountry.flag}</span>
                  <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
                  <span className={styles.dropdownArrow}>▼</span>
                </div>
                {showCountryDropdown && (
                  <div className={styles.countryDropdown}>
                    {countries.map((country) => (
                      <div
                        key={country.code}
                        className={styles.countryOption}
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                        }}
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
            {errors[`${order.id}_recipientPhone`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientPhone`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>عنوان العميل</label>
            <input
              type="text"
              className={`${styles.input} ${errors[`${order.id}_clientAddress`] ? styles.inputError : ""}`}
              placeholder="ادخل عنوان العميل هنا"
              value={order.clientAddress}
              onChange={(e) => updateOrder(order.id, "clientAddress", e.target.value)}
            />
            {errors[`${order.id}_clientAddress`] && (
              <span className={styles.errorText}>{errors[`${order.id}_clientAddress`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>المدينة</label>
            <div className={styles.selectWrapper}>
              <select
                className={`${styles.select} ${errors[`${order.id}_city`] ? styles.inputError : ""}`}
                value={order.city}
                onChange={(e) => updateOrder(order.id, "city", e.target.value)}
              >
                <option value="">اختر المدينة</option>
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
              </select>
              <span className={styles.selectArrow}>›</span>
            </div>
            {errors[`${order.id}_city`] && (
              <span className={styles.errorText}>{errors[`${order.id}_city`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الملاحظات</label>
            <textarea
              className={styles.textarea}
              placeholder="ادخل الملاحظات هنا"
              rows={3}
              value={order.notes}
              onChange={(e) => updateOrder(order.id, "notes", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.toggleContainer}>
            <button
              className={styles.toggleButton}
              onClick={handleAddAnotherOrder}
            >
              اضافة طلب اخر
            </button>
            <button
              className={`${styles.toggleButton} ${styles.toggleButtonActive}`}
              onClick={handleConfirmOrder}
            >
              تأكيد الطلب
            </button>
          </div>
          <h1 className={styles.pageTitle}>
            <span className={styles.backArrow} onClick={() => router.push("/orders")}>
              ←
            </span>
            اضافة طلب
          </h1>
        </div>

        {orders.map((order) => renderOrderForm(order))}
      </div>
    </main>
  );
}
