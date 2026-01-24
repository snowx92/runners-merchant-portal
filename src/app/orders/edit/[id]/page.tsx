"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/editOrder.module.css";
import { Cairo } from "next/font/google";
import { orderService } from "@/lib/api/services";
import { zoneService } from "@/lib/api/services/zoneService";
import { locationService } from "@/lib/api/services/locationService";
import type { Zone, City } from "@/lib/api/types/zone.types";
import type { UserAddress } from "@/lib/api/types/address.types";
import { useToast } from "@/lib/contexts/ToastContext";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [govId, setGovId] = useState("");
  const [cityId, setCityId] = useState("");
  const [cash, setCash] = useState("");
  const [fees, setFees] = useState("");
  const [type, setType] = useState<"COD" | "PREPAID">("COD");
  const [notes, setNotes] = useState("");
  const [content, setContent] = useState("");
  const [pickupId, setPickupId] = useState("");

  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (govId && zones.length > 0) {
      const selectedZone = zones.find(z => z.id === govId);
      setFilteredCities(selectedZone?.cities || []);
    } else {
      setFilteredCities([]);
    }
  }, [govId, zones]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load zones, user addresses, and order data in parallel
      const [zonesRes, addressesRes] = await Promise.allSettled([
        zoneService.getZones(),
        locationService.getLocations()
      ]);

      if (zonesRes.status === "fulfilled" && zonesRes.value?.data) {
        setZones(zonesRes.value.data);
      }

      if (addressesRes.status === "fulfilled" && addressesRes.value) {
        setUserAddresses(addressesRes.value);
      }

      // Load order data
      await loadOrderData();
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadOrderData = async () => {
    try {
      const response = await orderService.getSingleOrder(orderId);

      if (response) {
        const order = response;
        // Populate form with existing order data
        setName(order.customer?.name || "");
        setPhone(order.customer?.phone || "");
        setAddress(order.customer?.address || "");
        setGovId(order.customer?.govId || "");
        setCityId(order.customer?.cityId || "");
        setCash(order.cash?.toString() || "");
        setFees(order.shippingAmount?.toString() || "");
        setType(order.type || "COD");
        setNotes(order.notes || "");
        setContent(order.content || "");
        setPickupId(order.pickup?.id || "");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      showToast("فشل تحميل بيانات الطلب", "error");
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      showToast("يرجى إدخال اسم العميل", "warning");
      return;
    }
    if (!phone.trim()) {
      showToast("يرجى إدخال رقم هاتف العميل", "warning");
      return;
    }
    if (!address.trim()) {
      showToast("يرجى إدخال عنوان العميل", "warning");
      return;
    }
    if (!govId) {
      showToast("يرجى اختيار المحافظة", "warning");
      return;
    }
    if (!cityId) {
      showToast("يرجى اختيار المدينة", "warning");
      return;
    }
    if (!pickupId) {
      showToast("يرجى اختيار عنوان الاستلام", "warning");
      return;
    }
    if (!cash || parseFloat(cash) <= 0) {
      showToast("يرجى إدخال قيمة صحيحة للمبلغ", "warning");
      return;
    }

    try {
      setSaving(true);
      await orderService.updateSingleOrder(orderId, {
        name,
        phone,
        address,
        cityId,
        govId,
        pickupId,
        cash: parseFloat(cash),
        fees: parseFloat(fees) || 0,
        type,
        notes,
        content,
      });

      showToast("تم تحديث الطلب بنجاح", "success");
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);
      showToast("فشل تحديث الطلب", "error");
    } finally {
      setSaving(false);
    }
  };

  // Get address details when pickup is selected
  const selectedAddress = userAddresses.find(a => a.id === pickupId);

  if (loading) {
    return (
      <main className={`${styles.mainContainer} ${cairo.className}`}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loadingState}>جاري التحميل...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          
          <h1 className={styles.pageTitle}>
                        <span className={styles.backArrow} onClick={() => router.push(`/orders/${orderId}`)}>
              →
            </span>
            تعديل الطلب #{orderId}

          </h1>
          
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <h2 className={styles.sectionTitle}>بيانات العميل</h2>

          {/* Client Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>اسم العميل *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أدخل اسم العميل"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Phone Numbers */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>رقم الهاتف *</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
              />
            </div>
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>عنوان المستلم *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="أدخل عنوان المستلم"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Governorate and City */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>المحافظة *</label>
              <select
                className={styles.select}
                value={govId}
                onChange={(e) => {
                  setGovId(e.target.value);
                  setCityId("");
                }}
              >
                <option value="">اختر المحافظة</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>المدينة *</label>
              <select
                className={styles.select}
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                }}
                disabled={!govId}
              >
                <option value="">اختر المدينة</option>
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup Location */}
          <div className={styles.formGroup}>
              <label className={styles.label}>اختر عنوان الاستلام *</label>
            <select
              className={styles.select}
              value={pickupId}
              onChange={(e) => setPickupId(e.target.value)}
            >
              <option value="">اختر العنوان</option>
              {userAddresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.title} - {addr.street}, {addr.city}
                </option>
              ))}
            </select>
            {selectedAddress && (
              <p className={styles.addressHint}>
                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
              </p>
            )}
          </div>

          <h2 className={styles.sectionTitle}>بيانات الطلب</h2>

          {/* Cash and Fees */}
          <div className={styles.formRow}>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>قيمة الطلب *</label>
              <input
                type="number"
                className={styles.input}
                placeholder="أدخل قيمة الطلب"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>مبلغ التوصيل</label>
              <input
                type="number"
                className={styles.input}
                placeholder="مبلغ التوصيل"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>نوع الطلب *</label>
            <select
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as "COD" | "PREPAID")}
            >
              <option value="COD">الدفع عند الاستلام (COD)</option>
              <option value="PREPAID">مدفوع مسبقاً (PREPAID)</option>
            </select>
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
              <label className={styles.label}>محتوى الطلب</label>
            <input
              type="text"
              className={styles.input}
              placeholder="وصف محتوى الطلب"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
              <label className={styles.label}>ملاحظات</label>
            <textarea
              className={styles.textarea}
              placeholder="أي ملاحظات إضافية"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.cancelButton}
              onClick={() => router.push(`/orders/${orderId}`)}
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

