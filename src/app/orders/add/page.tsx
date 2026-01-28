"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/addOrder.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { zoneService } from "@/lib/api/services/zoneService";
import { orderService } from "@/lib/api/services/orderService";
import { locationService } from "@/lib/api/services/locationService";
import type { UserAddress } from "@/lib/api/types/address.types";
import type { Zone } from "@/lib/api/types/zone.types";
import type { CreateOrderRequest } from "@/lib/api/types/order.types";


const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});



interface OrderForm {
  id: number;
  packageDescription: string;
  packagePrice: string;
  deliveryPrice: string;
  recipientAddress: string;
  recipientName: string;
  recipientPhone: string;
  clientAddressId: string;
  governorate: string;
  governorateId: string;
  city: string;
  cityId: string;
  paymentType: "COD" | "PREPAID";
  notes: string;
  image: string | null;
  isCollapsed: boolean;
}

export default function AddOrder() {
  const router = useRouter();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("orders.add");
  const tCommon = useTranslations("common");

  // API data states
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<OrderForm[]>([
    {
      id: 1,
      packageDescription: "",
      packagePrice: "",
      deliveryPrice: "",
      recipientAddress: "",
      recipientName: "",
      recipientPhone: "",
      clientAddressId: "",
      governorate: "",
      governorateId: "",
      city: "",
      cityId: "",
      paymentType: "COD",
      notes: "",
      image: null,
      isCollapsed: false,
    },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch addresses and zones on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [addressesRes, zonesRes] = await Promise.allSettled([
          locationService.getLocations(),
          zoneService.getZones(),
        ]);

        if (addressesRes.status === "fulfilled" && addressesRes.value) {
          setUserAddresses(addressesRes.value);
        }

        if (zonesRes.status === "fulfilled" && zonesRes.value && zonesRes.value.data) {
          const zonesData = zonesRes.value.data;
          setZones(zonesData);

          // Find Cairo (القاهرة or Cairo) and set it as default for all orders
          const cairoZone = zonesData.find((zone) => 
            zone.name === "القاهرة" || zone.name === "Cairo" || zone.name === "cairo"
          );
          if (cairoZone) {
            setOrders((prev) =>
              prev.map((order) => ({
                ...order,
                governorate: cairoZone.name,
                governorateId: cairoZone.id,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Helper function to get cities for a selected governorate
  const getCitiesForGovernorate = (governorateId: string) => {
    const zone = zones.find((z) => z.id === governorateId);
    return zone?.cities || [];
  };

  // Handle governorate change - reset city when governorate changes
  const handleGovernorateChange = (orderId: number, governorateId: string, governorateName: string) => {
    updateOrder(orderId, "governorateId", governorateId);
    updateOrder(orderId, "governorate", governorateName);
    // Reset city when governorate changes
    updateOrder(orderId, "cityId", "");
    updateOrder(orderId, "city", "");
  };

  const validateOrder = (order: OrderForm, orderId: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!order.clientAddressId.trim()) {
      newErrors[`${orderId}_clientAddressId`] = t("chooseAddressError");
    }
    if (!order.packageDescription.trim()) {
      newErrors[`${orderId}_packageDescription`] = t("packageDescriptionError");
    }
    if (!order.packagePrice.trim() || isNaN(Number(order.packagePrice))) {
      newErrors[`${orderId}_packagePrice`] = t("packagePriceError");
    }
    if (!order.deliveryPrice.trim() || isNaN(Number(order.deliveryPrice))) {
      newErrors[`${orderId}_deliveryPrice`] = t("deliveryPriceError");
    }
    if (!order.recipientAddress.trim()) {
      newErrors[`${orderId}_recipientAddress`] = t("recipientAddressError");
    }
    if (!order.recipientName.trim()) {
      newErrors[`${orderId}_recipientName`] = t("recipientNameError");
    }
    if (!order.recipientPhone.trim()) {
      newErrors[`${orderId}_recipientPhone`] = t("recipientPhoneError");
    } else if (!/^\d{11}$/.test(order.recipientPhone) || !order.recipientPhone.startsWith("0")) {
      newErrors[`${orderId}_recipientPhone`] = t("recipientPhoneInvalidError");
    }
    if (!order.governorateId.trim()) {
      newErrors[`${orderId}_governorate`] = t("governorateError");
    }
    if (!order.cityId.trim()) {
      newErrors[`${orderId}_city`] = t("cityError");
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

  const updateOrder = (orderId: number, field: keyof OrderForm, value: OrderForm[keyof OrderForm]) => {
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
          clientAddressId: "",
          governorate: "",
          governorateId: "",
          city: "",
          cityId: "",
          paymentType: "COD",
          notes: "",
          image: null,
          isCollapsed: false,
        },
      ]);
    }
  };

  const handleConfirmOrder = async () => {
    let allValid = true;
    orders.forEach((order) => {
      if (!validateOrder(order, order.id)) {
        allValid = false;
      }
    });

    if (!allValid) {
      return;
    }

    try {
      setLoading(true);

      // If there's only one order, create it directly
      if (orders.length === 1) {
        const order = orders[0];
        const orderData: CreateOrderRequest = {
          name: order.recipientName,
          phone: order.recipientPhone,
          address: order.recipientAddress,
          cityId: order.cityId,
          govId: order.governorateId,
          pickupId: order.clientAddressId,
          cash: Number(order.packagePrice),
          fees: Number(order.deliveryPrice),
          content: order.packageDescription,
          notes: order.notes,
          type: order.paymentType,
        };

        const response = await orderService.createOrder(orderData);

        if (response) {
          console.log("✅ Order created successfully:", response);
          router.push("/orders");
        } else {
          throw new Error("Failed to create order");
        }
      } else {
        // Create bulk orders
        const bulkOrdersData = {
          orders: orders.map((order) => ({
            name: order.recipientName,
            phone: order.recipientPhone,
            address: order.recipientAddress,
            cityId: order.cityId,
            govId: order.governorateId,
            pickupId: order.clientAddressId,
            cash: Number(order.packagePrice),
            fees: Number(order.deliveryPrice),
            content: order.packageDescription,
            notes: order.notes,
            type: order.paymentType as "COD" | "PREPAID",
          })),
        };

        const response = await orderService.createBulkOrders(bulkOrdersData);

        if (response) {
          console.log("✅ Bulk orders created successfully:", response);
          router.push("/orders");
        } else {
          throw new Error("Failed to create bulk orders");
        }
      }
    } catch (error) {
      console.error("❌ Error creating order(s):", error);
      alert(error instanceof Error ? error.message : t("failedToCreateOrder"));
    } finally {
      setLoading(false);
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
                {order.recipientName || tCommon("user")} - {order.packageDescription.substring(0, 30) || t("packageDescriptionPlaceholder")}
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
                <span className={styles.orderHeaderTitle}>{t("orderHeaderTitle")}</span>
              </div>
            </div>
          )}

          {/* اختر عنوانك - FIRST FIELD */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("chooseAddress")}</label>
            <div className={styles.selectWrapper}>
              <select
                className={`${styles.select} ${errors[`${order.id}_clientAddressId`] ? styles.inputError : ""}`}
                value={order.clientAddressId}
                onChange={(e) => updateOrder(order.id, "clientAddressId", e.target.value)}
              >
                <option value="">{t("selectAddress")}</option>
                {userAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.title} - {address.street}, {address.city}
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}>›</span>
            </div>
            {errors[`${order.id}_clientAddressId`] && (
              <span className={styles.errorText}>{errors[`${order.id}_clientAddressId`]}</span>
            )}
          </div>

          {/* المحافظة والمدينة - Governorate and City in same row */}
          <div className={styles.formRow}>
            {/* المحافظة - Governorate dropdown */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("governorate")}</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.select} ${errors[`${order.id}_governorate`] ? styles.inputError : ""}`}
                  value={order.governorateId}
                  onChange={(e) => {
                    const selectedZone = zones.find((z) => z.id === e.target.value);
                    if (selectedZone) {
                      handleGovernorateChange(order.id, selectedZone.id, selectedZone.name);
                    }
                  }}
                >
                  <option value="">{t("selectGovernorate")}</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow}>›</span>
              </div>
              {errors[`${order.id}_governorate`] && (
                <span className={styles.errorText}>{errors[`${order.id}_governorate`]}</span>
              )}
            </div>
            {/* المدينة - City dropdown (depends on governorate) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("city")}</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.select} ${errors[`${order.id}_city`] ? styles.inputError : ""}`}
                  value={order.cityId}
                  onChange={(e) => {
                    const cities = getCitiesForGovernorate(order.governorateId);
                    const selectedCity = cities.find((c) => c.id === e.target.value);
                    if (selectedCity) {
                      updateOrder(order.id, "cityId", selectedCity.id);
                      updateOrder(order.id, "city", selectedCity.name);
                    }
                  }}
                  disabled={!order.governorateId}
                >
                  <option value="">{t("selectCity")}</option>
                  {getCitiesForGovernorate(order.governorateId).map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                 </select>
                <span className={styles.selectArrow}> › </span>
              </div>
              {errors[`${order.id}_city`] && (
                <span className={styles.errorText}>{errors[`${order.id}_city`]}</span>
              )}
            </div>


          </div>

          {/* Payment Type - نوع الدفع */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("paymentType")}</label>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              marginTop: "0.5rem",
              width: "100%"
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                flex: 1
              }}>
                <input
                  type="checkbox"
                  checked={order.paymentType === "COD"}
                  onChange={() => updateOrder(order.id, "paymentType", "COD")}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    borderRadius: "50%",
                    appearance: "none",
                    WebkitAppearance: "none",
                    border: "2px solid #ddd",
                    position: "relative",
                    backgroundColor: order.paymentType === "COD" ? "#000" : "transparent",
                    transition: "all 0.2s ease"
                  }}
                />
                <span style={{ fontSize: "14px" }}>{t("cod")}</span>
              </label>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                flex: 1
              }}>
                <input
                  type="checkbox"
                  checked={order.paymentType === "PREPAID"}
                  onChange={() => updateOrder(order.id, "paymentType", "PREPAID")}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    borderRadius: "50%",
                    appearance: "none",
                    WebkitAppearance: "none",
                    border: "2px solid #ddd",
                    position: "relative",
                    backgroundColor: order.paymentType === "PREPAID" ? "#000" : "transparent",
                    transition: "all 0.2s ease"
                  }}
                />
                <span style={{ fontSize: "14px" }}>{t("prepaid")}</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("packageDescription")}</label>
            <textarea
              className={`${styles.textarea} ${errors[`${order.id}_packageDescription`] ? styles.inputError : ""}`}
              placeholder={t("packageDescriptionPlaceholder")}
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
              <label className={styles.label}>{t("deliveryPrice")}</label>
              <input
                type="text"
                className={`${styles.input} ${errors[`${order.id}_deliveryPrice`] ? styles.inputError : ""}`}
                placeholder={t("deliveryPricePlaceholder")}
                value={order.deliveryPrice}
                onChange={(e) => updateOrder(order.id, "deliveryPrice", e.target.value)}
              />
              {errors[`${order.id}_deliveryPrice`] && (
                <span className={styles.errorText}>{errors[`${order.id}_deliveryPrice`]}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("packagePrice")}</label>
              <input
                type="text"
                className={`${styles.input} ${errors[`${order.id}_packagePrice`] ? styles.inputError : ""}`}
                placeholder={t("packagePricePlaceholder")}
                value={order.packagePrice}
                onChange={(e) => updateOrder(order.id, "packagePrice", e.target.value)}
              />
              {errors[`${order.id}_packagePrice`] && (
                <span className={styles.errorText}>{errors[`${order.id}_packagePrice`]}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("packageImage")}</label>
            <input
              ref={(el) => {
                fileInputRefs.current[order.id] = el;
              }}
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => handleImageUpload(e, order.id)}
              style={{ display: 'none' }}
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
                <p className={styles.uploadText}>{t("uploadImagePlaceholder")}</p>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("recipientAddress")}</label>
            <input
              type="text"
              className={`${styles.input} ${errors[`${order.id}_recipientAddress`] ? styles.inputError : ""}`}
              placeholder={t("recipientAddressPlaceholder")}
              value={order.recipientAddress}
              onChange={(e) => updateOrder(order.id, "recipientAddress", e.target.value)}
            />
            {errors[`${order.id}_recipientAddress`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientAddress`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("recipientName")}</label>
            <input
              type="text"
              className={`${styles.input} ${errors[`${order.id}_recipientName`] ? styles.inputError : ""}`}
              placeholder={t("recipientNamePlaceholder")}
              value={order.recipientName}
              onChange={(e) => updateOrder(order.id, "recipientName", e.target.value)}
            />
            {errors[`${order.id}_recipientName`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientName`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("recipientPhone")}</label>
            <input
              type="text"
              className={`${styles.input} ${errors[`${order.id}_recipientPhone`] ? styles.inputError : ""}`}
              placeholder={t("recipientPhonePlaceholder")}
              value={order.recipientPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 11) {
                  updateOrder(order.id, "recipientPhone", value);
                }
              }}
              maxLength={11}
            />
            {errors[`${order.id}_recipientPhone`] && (
              <span className={styles.errorText}>{errors[`${order.id}_recipientPhone`]}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("notes")}</label>
            <textarea
              className={styles.textarea}
              placeholder={t("notesPlaceholder")}
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
    <main className={`${styles.mainContainer} ${cairo.className}`} data-rtl={isRTL} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header} data-rtl={isRTL}>
          <h1 className={styles.pageTitle} data-rtl={isRTL}>
            <span className={styles.backArrow} data-rtl={isRTL} onClick={() => router.push("/orders")}>
              →
            </span>
            {t("title")}
          </h1>
          <div className={styles.toggleContainer}>
            <button
              className={styles.toggleButton}
              onClick={handleAddAnotherOrder}
            >
              {t("addAnotherOrder")}
            </button>
            <button
              className={`${styles.toggleButton} ${styles.toggleButtonActive}`}
              onClick={handleConfirmOrder}
              disabled={loading}
            >
              {loading ? t("loading") : t("confirmOrder")}
            </button>
          </div>
        </div>

        {orders.map((order) => renderOrderForm(order))}
      </div>
    </main>
  );
}

