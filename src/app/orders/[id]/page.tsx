/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/orderDetails.module.css";
import { Cairo } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { orderService } from "@/lib/api/services";
import type { OrderBid } from "@/lib/api/types/order.types";
import Image from "next/image";
import { useToast } from "@/lib/contexts/ToastContext";
import QRCode from "qrcode";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

interface OrderDetails {
  id: string;
  qrCode?: string;
  cash: number | string;
  type: "COD" | "PREPAID";
  shippingAmount: number | string;
  otp?: string | null;
  receiveOTP?: string;
  cancelOTP?: string | null;
  courierShippingAmount: number;
  status: string;
  cashStatus: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  bidsCount: number;
  bids: unknown[];
  canRate: boolean;
  notes: string;
  content: string;
  attachment: string;
  requiredSupplierFailedAmount: number;
  selectedCourier: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    method: string;
    rating: number;
    verified: boolean;
    successCount: number;
  } | null;
  pickup: {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    street: string;
    city: string;
    cityId: string;
    state: string;
    stateId: string;
    phoneNumber: string;
    buildingNumber: string;
    floorNumber: string;
    apartmentNumber: string;
    notes: string;
  };
  failedInfo?: unknown | null;
  customer: {
    phone: string;
    otherPhone: string;
    address: string;
    name: string;
    gov: string;
    city: string;
    govId: string;
    cityId: string;
    dropOffLocation?: {
      lat: number;
      lng: number;
      hash: string;
      isSystemGenerated: boolean;
    };
    distanceBetweenPickupAndDropOffInKm?: number;
  };
}

interface BidWithCourier extends OrderBid {
  courier: {
    name: string;
    avatar: string;
    rating: number;
    phone: string;
    method: string;
    successCount: number;
  };
}

// QR Code Display Component
function QRCodeDisplay({ data }: { data: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Try to decode JWT format to get the actual data
        let qrData = data;
        try {
          const parts = data.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            // Check for various possible field names
            qrData = payload.qrCode || payload.data || payload.encryptedData || data;
          }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          // If not JWT, use as is
        }
        
        // Generate QR code as data URL
        const url = await QRCode.toDataURL(qrData, {
          width: 250,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data]);

  if (loading) {
    return (
      <div className={styles.qrCodePlaceholder}>
        <div className={styles.qrCodeLoading}>
          <span style={{ fontSize: '2rem' }}>⏳</span>
          <p>جاري تحميل QR Code...</p>
        </div>
      </div>
    );
  }

  if (error || !qrDataUrl) {
    return (
      <div className={styles.qrCodePlaceholder}>
        <span style={{ fontSize: '3rem' }}>📱</span>
        <p>فشل في تحميل QR Code</p>
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR Code"
      className={styles.qrCodeImage}
    />
  );
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRefObj = useRef<google.maps.Map | null>(null);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [bids, setBids] = useState<BidWithCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBid, setProcessingBid] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (order && order.status === "PENDING" && mapLoaded) {
      initializeMap();
    }
  }, [order, mapLoaded]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderRes, bidsRes] = await Promise.allSettled([
        orderService.getSingleOrder(orderId),
        orderService.getOrderBids(orderId),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value) {
        setOrder(orderRes.value as unknown as OrderDetails);
      } else if (orderRes.status === "rejected") {
        console.error("Order fetch failed:", orderRes.reason);
      }

      if (bidsRes.status === "fulfilled" && bidsRes.value) {
        setBids(bidsRes.value as unknown as BidWithCourier[]);
      } else if (bidsRes.status === "rejected") {
        console.error("Bids fetch failed:", bidsRes.reason);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!order || !mapRef.current || !window.google) return;

    const dropOffLocation = order.customer.dropOffLocation;
    const defaultCenter = { lat: 30.0444, lng: 31.2357 };

    const center = dropOffLocation
      ? { lat: dropOffLocation.lat, lng: dropOffLocation.lng }
      : defaultCenter;

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

    const marker = new google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
      title: "مكان التوصيل",
    });

    markerRef.current = marker;

    marker.addListener("dragend", async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        await updateDropOffLocation(lat, lng);
      }
    });
  };

  const updateDropOffLocation = async (lat: number, lng: number) => {
    try {
      setProcessingAction(true);
      await orderService.adjustLocation(orderId, { lat, lng });
      await fetchOrderDetails();
      showToast("تم تحديث موقع التوصيل بنجاح", "success");
    } catch (error) {
      console.error("Error updating drop-off location:", error);
      showToast("فشل في تحديث موقع التوصيل", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا العرض؟")) return;

    try {
      setProcessingBid(bidId);
      await orderService.updateBid(bidId, {
        orderId: orderId,
        status: "ACCEPTED",
      });
      await fetchOrderDetails();
      showToast("تم قبول العرض بنجاح", "success");
    } catch (error) {
      console.error("Error accepting bid:", error);
      showToast("فشل في قبول العرض", "error");
    } finally {
      setProcessingBid(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!window.confirm("هل أنت متأكد من رفض هذا العرض؟")) return;

    try {
      setProcessingBid(bidId);
      await orderService.updateBid(bidId, {
        orderId: orderId,
        status: "REJECTED",
      });
      const bidsRes = await orderService.getOrderBids(orderId);
      if (bidsRes) {
        setBids(bidsRes as unknown as BidWithCourier[]);
      }
      showToast("تم رفض العرض بنجاح", "success");
    } catch (error) {
      console.error("Error rejecting bid:", error);
      showToast("فشل في رفض العرض", "error");
    } finally {
      setProcessingBid(null);
    }
  };

  const handleViewCourierProfile = (courierId: string, bidId?: string) => {
    if (bidId) {
      router.push(`/runners/${courierId}?bidId=${bidId}&orderId=${orderId}`);
    } else {
      router.push(`/runners/${courierId}`);
    }
  };

  const handleMarkAsReturned = async () => {
    try {
      setProcessingAction(true);
      const response = await orderService.confirmReturnOrder(orderId);
      await fetchOrderDetails();
      setShowReturnModal(false);
      // Show success message - either from API response or default
      const successMessage = response?.message || "تم تأكيد استلام المرتجع بنجاح";
      showToast(successMessage, "success");
    } catch (error) {
      console.error("Error marking order as returned:", error);
      showToast("فشل في تأكيد استلام المرتجع", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRelistOrder = async () => {
    if (!window.confirm("هل أنت متأكد من إعادة طرح هذا الطلب؟")) return;

    try {
      setProcessingAction(true);
      await orderService.relistOrder(orderId);
      await fetchOrderDetails();
      showToast("تم إعادة طرح الطلب بنجاح", "success");
    } catch (error) {
      console.error("Error relisting order:", error);
      showToast("فشل في إعادة طرح الطلب", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showToast("يرجى إدخال سبب الإلغاء", "warning");
      return;
    }

    try {
      setProcessingAction(true);
      await orderService.cancelCourier(orderId, { reason: cancelReason });
      await fetchOrderDetails();
      setShowCancelModal(false);
      setCancelReason("");
      showToast("تم إلغاء الطلب بنجاح", "success");
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToast("فشل في إلغاء الطلب", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      setProcessingAction(true);
      await orderService.addReview(orderId, {
        stars: rating,
        content: reviewContent,
      });
      await fetchOrderDetails();
      setShowRatingModal(false);
      setRating(5);
      setReviewContent("");
      showToast("تم إرسال التقييم بنجاح", "success");
    } catch (error) {
      console.error("Error submitting rating:", error);
      showToast("فشل في إرسال التقييم", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEditOrder = () => {
    router.push(`/orders/edit/${orderId}`);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "جديد",
      PENDING_COURIER: "في انتظار المندوب",
      RECEIVED: "تم الاستلام من التاجر",
      ACCEPTED: "مقبول",
      PICKED_UP: "تم الاستلام",
      DELIVERED: "قيد التسليم",
      COMPLETED: "مكتمل",
      CANCELLED: "ملغي",
      EXPIRED: "منتهي",
      FAILED: "فشل",
      RETURNED: "مرتجع",
    };
    return labels[status] || status;
  };

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const canShowMap = () => {
    return order?.status === "PENDING";
  };

  const canShowReceiveOTP = () => {
    return order?.status === "PENDING_COURIER";
  };

  const canShowCancelOTP = () => {
    return order?.status === "FAILED" && order.cancelOTP;
  };

  const canShowPREPAIDOTP = () => {
    return order?.type === "PREPAID";
  };

  const loadGoogleMapsScript = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not found");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (canShowMap()) {
      loadGoogleMapsScript();
    }
  }, [order]);

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

  if (!order) {
    return (
      <main className={`${styles.mainContainer} ${cairo.className}`}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyState}>لم يتم العثور على الطلب</div>
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
          <div className={styles.orderActions}>
            {/* PENDING: Edit, Cancel, Map */}
            {order.status === "PENDING" && (
              <>
                <button
                  className={styles.actionButton}
                  onClick={handleEditOrder}
                  disabled={processingAction}
                >
                  تعديل الطلب
                </button>
                <button
                  className={styles.actionButtonWarning}
                  onClick={() => setShowCancelModal(true)}
                  disabled={processingAction}
                >
                  إلغاء الطلب
                </button>
              </>
            )}

            {/* PENDING_COURIER: QR, OTP, Cancel */}
            {order.status === "PENDING_COURIER" && (
              <>
                {order.qrCode && (
                  <button
                    className={styles.actionButton}
                    onClick={() => setShowQRModal(true)}
                  >
                    عرض QR Code
                  </button>
                )}
                <button
                  className={styles.actionButtonWarning}
                  onClick={() => setShowCancelModal(true)}
                  disabled={processingAction}
                >
                  إلغاء الطلب
                </button>
              </>
            )}

            {/* RECEIVED: Cancel */}
            {order.status === "RECEIVED" && (
              <button
                className={styles.actionButtonWarning}
                onClick={() => setShowCancelModal(true)}
                disabled={processingAction}
              >
                إلغاء الطلب
              </button>
            )}

            {/* COMPLETED/RETURNED: Rating if canRate */}
            {(order.status === "COMPLETED" || order.status === "RETURNED") && (
              <>
                {order.canRate && (
                  <button
                    className={styles.actionButton}
                    onClick={() => setShowRatingModal(true)}
                  >
                    تقييم
                  </button>
                )}
              </>
            )}

            {/* FAILED: Return Confirmation */}
            {order.status === "FAILED" && (
              <button
                className={styles.actionButton}
                onClick={() => setShowReturnModal(true)}
                disabled={processingAction}
              >
                تم استلام المرتجع
              </button>
            )}

            {/* CANCELLED/EXPIRED: Edit, Relist */}
            {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
              <>
                <button
                  className={styles.actionButton}
                  onClick={handleEditOrder}
                  disabled={processingAction}
                >
                  تعديل الطلب
                </button>
                <button
                  className={styles.actionButton}
                  onClick={handleRelistOrder}
                  disabled={processingAction}
                >
                  إعادة طرح الطلب
                </button>
              </>
            )}
          </div>

          <h1 className={styles.pageTitle}>
            تفاصيل الطلب #{order.id}
          </h1>
          
          <span className={styles.backArrow} onClick={() => router.push("/orders")}>
            →
          </span>
        </div>

        {/* OTP Section for PREPAID */}
        {canShowPREPAIDOTP() && (
          <div className={styles.otpSection}>
            <div className={styles.otpCard}>
              <div className={styles.otpIcon}>🔐</div>
              <div className={styles.otpContent}>
                <h3 className={styles.otpTitle}>رمز OTP للدفع المسبق</h3>
                <p className={styles.otpDescription}>
                  هذا الرمز خاص بالدفع المسبق، احتفظ به وأعطه للمندوب عند التسليم
                </p>
                <div className={styles.otpCode}>{order.otp}</div>
              </div>
            </div>
          </div>
        )}

        {/* Receive OTP Section for PENDING_COURIER */}
        {canShowReceiveOTP() && order.receiveOTP && (
          <div className={styles.otpSection}>
            <div className={styles.otpCard}>
              <div className={styles.otpIcon}>📱</div>
              <div className={styles.otpContent}>
                <h3 className={styles.otpTitle}>رمز استلام OTP</h3>
                <p className={styles.otpDescription}>
                  هذا الرمز لاستلام الطلب من التاجر
                </p>
                <div className={styles.otpCode}>{order.receiveOTP}</div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel OTP Section for FAILED */}
        {canShowCancelOTP() && (
          <div className={styles.otpSection}>
            <div className={styles.otpCard}>
              <div className={styles.otpIcon}>🔓</div>
              <div className={styles.otpContent}>
                <h3 className={styles.otpTitle}>رمز إلغاء OTP</h3>
                <p className={styles.otpDescription}>
                  رمز الإلغاء (للإلغاء دون سبب)
                </p>
                <div className={styles.otpCode}>{order.cancelOTP}</div>
              </div>
            </div>
          </div>
        )}

        {/* Google Maps Section for PENDING */}
        {canShowMap() && (
          <div className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <h3 className={styles.mapTitle}>تحديد موقع التوصيل</h3>
              <p className={styles.mapDescription}>
                اسحب العلامة على الخريطة لتحديد موقع التوصيل الجديد
              </p>
            </div>
            <div className={styles.mapContainer} ref={mapRef}></div>
            {order.customer.dropOffLocation && (
              <div className={styles.mapAddress}>
                <span className={styles.mapAddressIcon}>📍</span>
                <span>{order.customer.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Order Info and Price Section */}
        <div className={styles.orderSection}>
          {/* Price Cards - Right Half */}
          <div className={styles.priceCardsGrid}>
            <div className={styles.priceCard}>
              <span className={styles.priceLabel}>سعر الشحنة</span>
              <span className={styles.priceValue}>{order.cash} جنيه</span>
            </div>
            <div className={styles.priceCard}>
              <span className={styles.priceLabel}>سعر التوصيل</span>
              <span className={styles.priceValue}>{order.shippingAmount} جنيه</span>
            </div>
            {order.type === "PREPAID" && order.otp && (
              <div className={styles.priceCardOtp}>
                <span className={styles.priceLabel}>رمز OTP</span>
                <span className={styles.otpValue}>{order.otp}</span>
              </div>
            )}
          </div>

          {/* Order Info Card - Left Half */}
          <div className={styles.orderInfoCard}>
            <div className={styles.orderTop}>
              <span className={styles.orderDate}>{formatDate(order.createdAt._seconds)}</span>
<span className={`${styles.statusBadge} ${order.status === "CANCELLED" ? styles.statusBadgeCancelled : ""}`}>{getStatusLabel(order.status)}</span>
            </div>

            <div className={styles.orderMain}>
              <div className={styles.orderTextContent}>
                <h2 className={styles.orderTitle}>
                  {order.customer.name}
                </h2>
                <p className={styles.orderDescription}>
                  {order.customer.address}
                </p>
                <p className={styles.orderDescription}>
                  {order.customer.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

{/* Offers Section - Only show for PENDING status */}
        {order.status === "PENDING" && (
        <div className={styles.offersSection}>
          <div className={styles.offersSectionHeader}>
            <h2 className={styles.offersTitle}>
              العروض المقدمة ({bids.length.toString().padStart(2, "0")})
            </h2>
          </div>

          <div className={styles.offersList}>
            {bids.length === 0 ? (
              <div className={styles.emptyState}>لا توجد عروض حتى الآن</div>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className={styles.offerCard}>
                  <div className={styles.offerContent}>
                    <div className={styles.runnerRow}>
                      <div
                        className={styles.runnerAvatar}
                        onClick={() => handleViewCourierProfile(bid.userId, bid.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <Image
                          src={bid.courier.avatar || "/icons/User.svg"}
                          alt={bid.courier.name}
                          width={60}
                          height={60}
                        />
                      </div>
                      <div
                        className={styles.runnerInfo}
                        onClick={() => handleViewCourierProfile(bid.userId, bid.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <h3 className={styles.runnerName}>{bid.courier.name}</h3>
                        <div className={styles.runnerMeta}>
                          <span className={styles.runnerOrders}>
                            {bid.courier.successCount} عملية ناجحة
                          </span>
                          <span className={styles.runnerRating}>
                            {bid.courier.rating} ⭐
                          </span>
                        </div>
                      </div>
                      <div className={styles.offerDetailsRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>سعر التوصيل المقترح</span>
                          <span className={styles.detailValue}>{bid.amount} جنيه</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>تاريخ العرض</span>
                          <span className={styles.detailValue}>
                            {formatDate(bid.createdAt._seconds)}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>طريقة التوصيل</span>
                          <span className={styles.detailValue}>{bid.courier.method}</span>
                        </div>
                      </div>
                      {bid.status === "PENDING" && (
                        <div className={styles.offerButtons}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={processingBid === bid.id}
                          >
                            <span>✓</span>
                            {processingBid === bid.id ? "جاري المعالجة..." : "قبول العرض"}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={processingBid === bid.id}
                          >
                            <span>✕</span>
                            رفض العرض
                          </button>
                        </div>
                      )}
                      {bid.status !== "PENDING" && (
                        <div className={styles.bidStatusBadge}>
                          {bid.status === "ACCEPTED" ? "مقبول ✓" : "مرفوض ✕"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>إلغاء الطلب</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowCancelModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.modalLabel}>سبب الإلغاء</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="اكتب سبب إلغاء الطلب..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                >
                  إلغاء
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleCancelOrder}
                  disabled={processingAction}
                >
                  {processingAction ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Returned Modal */}
        {showReturnModal && (
          <div className={styles.modalOverlay} onClick={() => setShowReturnModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>تأكيد استلام المرتجع</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowReturnModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalHint}>
                  هل أنت متأكد من تأكيد استلام المرتجع؟ سيتم تحديث حالة الطلب.
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => {
                    setShowReturnModal(false);
                  }}
                >
                  إلغاء
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleMarkAsReturned}
                  disabled={processingAction}
                >
                  {processingAction ? "جاري التأكيد..." : "تأكيد الاستلام"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className={styles.modalOverlay} onClick={() => setShowRatingModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>تقييم المندوب</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowRatingModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.modalLabel}>التقييم</label>
                <div className={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`${styles.starButton} ${star <= rating ? styles.activeStar : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <label className={styles.modalLabel} style={{ marginTop: "1rem" }}>
                  التعليق (اختياري)
                </label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="اكتب تعليقا..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(5);
                    setReviewContent("");
                  }}
                >
                  إلغاء
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleSubmitRating}
                  disabled={processingAction}
                >
                  {processingAction ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && order.qrCode && (
          <div className={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>QR Code</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowQRModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody} style={{ textAlign: "center" }}>
                <div className={styles.qrCodeContainer}>
<QRCodeDisplay data={order.qrCode} />
                </div>
                <p className={styles.qrCodeHint}>
                  اعرض هذا الكود للمندوب
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={() => setShowQRModal(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

