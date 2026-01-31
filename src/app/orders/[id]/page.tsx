/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/orderDetails.module.css";
import { Cairo } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { orderService /* , commonService */ } from "@/lib/api/services";
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
  const t = useTranslations('orders.details');
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
          <p>{t('loadingQRCode')}</p>
        </div>
      </div>
    );
  }

  if (error || !qrDataUrl) {
    return (
      <div className={styles.qrCodePlaceholder}>
        <span style={{ fontSize: '3rem' }}>📱</span>
        <p>{t('failedLoadingQRCode')}</p>
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
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("orders.details");
  const tCommon = useTranslations("common");
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
  const [showReceiveCodeModal, setShowReceiveCodeModal] = useState(false);
  // const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // const [showWalletModal, setShowWalletModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelExplain, setCancelExplain] = useState("");
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
      showToast(t("locationUpdatedSuccess"), "success");
    } catch (error) {
      console.error("Error updating drop-off location:", error);
      showToast(t("locationUpdatedError"), "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!window.confirm(t("confirmAcceptBid"))) return;

    try {
      setProcessingBid(bidId);
      await orderService.updateBid(bidId, {
        orderId: orderId,
        status: "ACCEPTED",
      });
      await fetchOrderDetails();
      showToast(t("bidAcceptedSuccess"), "success");
    } catch (error) {
      console.error("Error accepting bid:", error);
      showToast(t("bidAcceptedError"), "error");
    } finally {
      setProcessingBid(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!window.confirm(t("confirmRejectBid"))) return;

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
      showToast(t("bidRejectedSuccess"), "success");
    } catch (error) {
      console.error("Error rejecting bid:", error);
      showToast(t("bidRejectedError"), "error");
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
      const successMessage = response?.message || t("returnConfirmedSuccess");
      showToast(successMessage, "success");
    } catch (error) {
      console.error("Error marking order as returned:", error);
      showToast(t("returnConfirmedError"), "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRelistOrder = async () => {
    if (!window.confirm(t("confirmRelist"))) return;

    try {
      setProcessingAction(true);
      await orderService.relistOrder(orderId);
      await fetchOrderDetails();
      showToast(t("relistSuccess"), "success");
    } catch (error) {
      console.error("Error relisting order:", error);
      showToast(t("relistError"), "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      showToast(t("enterCancelReason"), "warning");
      return;
    }

    try {
      setProcessingAction(true);
      await orderService.cancelCourier(orderId, { reason: cancelReason, explain: cancelExplain });
      await fetchOrderDetails();
      setShowCancelModal(false);
      setCancelReason("");
      setCancelExplain("");
      showToast(t("orderCancelledSuccess"), "success");
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToast(t("orderCancelledError"), "error");
    } finally {
      setProcessingAction(false);
    }
  };

  // const handleCancelNext = () => {
  //   if (!cancelReason) {
  //     showToast(t("enterCancelReason"), "warning");
  //     return;
  //   }
  //   setShowCancelModal(false);
  //   setShowCancelConfirm(true);
  // };

  // const handleCancelConfirm = async () => {
  //   try {
  //     setProcessingAction(true);
  //     const balanceRes = await commonService.getBalance();
  //     const balance = balanceRes?.data?.balance ?? 0;
  //
  //     if (balance < 50) {
  //       setShowCancelConfirm(false);
  //       setShowWalletModal(true);
  //       return;
  //     }
  //
  //     await orderService.cancelCourier(orderId, { reason: cancelReason, explain: cancelExplain });
  //     await fetchOrderDetails();
  //     setShowCancelConfirm(false);
  //     setCancelReason("");
  //     setCancelExplain("");
  //     showToast(t("orderCancelledSuccess"), "success");
  //   } catch (error) {
  //     console.error("Error cancelling order:", error);
  //     showToast(t("orderCancelledError"), "error");
  //   } finally {
  //     setProcessingAction(false);
  //   }
  // };

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
      showToast(t("ratingSubmittedSuccess"), "success");
    } catch (error) {
      console.error("Error submitting rating:", error);
      showToast(t("ratingSubmittedError"), "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEditOrder = () => {
    router.push(`/orders/edit/${orderId}`);
  };

  const statusTranslations = useTranslations("orders.status");

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "pending",
      PENDING_COURIER: "pendingCourier",
      RECEIVED: "received",
      ACCEPTED: "accepted",
      PICKED_UP: "pickedUp",
      DELIVERED: "delivered",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
      EXPIRED: "expired",
      FAILED: "failed",
      RETURNED: "returned",
    };
    const key = statusMap[status];
    return key ? statusTranslations(key) : status;
  };

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = isRTL
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${hours}:${minutes} ${isRTL ? 'م' : 'PM'} - ${day} ${month}`;
  };

  const getProgressStep = (status: string) => {
    // Step 1: createOrder (always done if order exists)
    // Step 2: receiveOffers (PENDING - waiting for bids)
    // Step 3: receiveOrder (courier assigned/picked up)
    // Step 4: deliverOrder (delivered/completed)
    switch (status) {
      case 'PENDING': return 2;
      case 'PENDING_COURIER':
      case 'ACCEPTED':
      case 'RECEIVED':
      case 'PICKED_UP': return 3;
      case 'DELIVERED':
      case 'COMPLETED':
      case 'RETURNED': return 4;
      case 'CANCELLED':
      case 'EXPIRED':
      case 'FAILED': return 0;
      default: return 0;
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      "WALKING": t("deliveryMethods.WALKING"),
      "BICYCLE": t("deliveryMethods.BICYCLE"),
      "MOTORCYCLE": t("deliveryMethods.MOTORCYCLE"),
      "CAR": t("deliveryMethods.CAR"),
    };
    return methodMap[method] || method;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      "PENDING": styles.statusBadgePending,
      "PENDING_COURIER": styles.statusBadgeAccepted,
      "RECEIVED": styles.statusBadgeAccepted,
      "ACCEPTED": styles.statusBadgeAccepted,
      "PICKED_UP": styles.statusBadgePickedUp,
      "DELIVERED": styles.statusBadgeDelivered,
      "COMPLETED": styles.statusBadgeCompleted,
      "CANCELLED": styles.statusBadgeCancelled,
      "EXPIRED": styles.statusBadgeCancelled,
      "FAILED": styles.statusBadgeFailed,
      "RETURNED": styles.statusBadgeReturned,
    };
    return statusMap[status] || styles.statusBadge;
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
      <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loadingState}>{tCommon("loading")}</div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyState}>{t("orderNotFound")}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.backArrow} onClick={() => router.push("/orders")}>
              {isRTL ? "→" : "←"}
            </span>
            <h1 className={styles.pageTitle}>
              {t("orderDetails")}
            </h1>
          </div>

          <div className={styles.orderActions}>
            {/* PENDING: Edit, Cancel, Map */}
            {order.status === "PENDING" && (
              <>
                <button
                  className={styles.actionButton}
                  onClick={handleEditOrder}
                  disabled={processingAction}
                >
                  {t("editOrder")}
                </button>
                <button
                  className={styles.actionButtonWarning}
                  onClick={() => setShowCancelModal(true)}
                  disabled={processingAction}
                >
                  {t("cancelOrder")}
                </button>
              </>
            )}

            {/* PENDING_COURIER and RECEIVED: Show QR Code */}
            {(order.status === "PENDING_COURIER" || order.status === "RECEIVED") && order.qrCode && (
              <button
                className={styles.actionButton}
                onClick={() => setShowQRModal(true)}
              >
                {t("showQRCode")}
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
                    {t("rate")}
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
                {t("confirmReturnReceived")}
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
                  {t("editOrder")}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={handleRelistOrder}
                  disabled={processingAction}
                >
                  {t("relistOrder")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* OTP Section for PREPAID */}
        {canShowPREPAIDOTP() && (
          <div className={styles.otpSection}>
            <div className={styles.otpCard}>
              <div className={styles.otpIcon}>🔐</div>
              <div className={styles.otpContent}>
                <h3 className={styles.otpTitle}>{t("otpPrepaid.title")}</h3>
                <p className={styles.otpDescription}>
                  {t("otpPrepaid.description")}
                </p>
                <div className={styles.otpCode}>{order.otp}</div>
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
                <h3 className={styles.otpTitle}>{t("otpCancel.title")}</h3>
                <p className={styles.otpDescription}>
                  {t("otpCancel.description")}
                </p>
                <div className={styles.otpCode}>{order.cancelOTP}</div>
              </div>
            </div>
          </div>
        )}

        {/* Order Info and Progress Section */}
        <div className={styles.orderSection}>
          {/* Order Info Card */}
          <div className={styles.orderInfoCard}>
            <div className={styles.orderTop}>
              <span className={styles.orderDate}>{formatDate(order.createdAt._seconds)}</span>
            <span className={getStatusBadgeClass(order.status)}>{getStatusLabel(order.status)}</span>
            </div>

            {order.attachment && (
              <div className={styles.orderImageWrapper}>
                <img
                  src={order.attachment}
                  alt={order.content || "Order"}
                  className={styles.orderImage}
                />
              </div>
            )}

            <div className={styles.orderMain}>
              <div className={styles.orderTextContent}>
                <h2 className={styles.orderTitle}>
                  {order.customer.name}
                </h2>
                <p className={styles.orderDescription}>
                  {order.content || order.customer.address}
                </p>
                <p className={styles.orderDescription}>
                  {order.customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar + Price Cards */}
          <div className={styles.orderLeftSide}>
            {/* Progress Bar */}
            <div className={styles.progressCard}>
              <div className={styles.progressBar}>
                {(() => {
                  const progressSteps = order.status === "CANCELLED" || order.status === "EXPIRED"
                    ? [
                        { label: t("progress.createOrder"), step: 1 },
                        { label: t("progress.cancelOrder"), step: 2 },
                      ]
                    : [
                        { label: t("progress.createOrder"), step: 1 },
                        { label: t("progress.receiveOffers"), step: 2 },
                        { label: t("progress.receiveOrder"), step: 3 },
                        { label: t("progress.deliverOrder"), step: 4 },
                      ];

                  return progressSteps.map((item, index) => {
                    const currentStep = order.status === "CANCELLED" || order.status === "EXPIRED" ? 2 : getProgressStep(order.status);
                    const isCompleted = currentStep >= item.step;
                    const isActive = currentStep === item.step;
                    return (
                      <div key={index} className={styles.progressStep}>
                        <div className={styles.progressStepIndicator}>
                          <div className={`${styles.progressDot} ${isCompleted ? styles.progressDotCompleted : ''} ${isActive ? styles.progressDotActive : ''}`}>
                            {isCompleted && <span className={styles.progressCheck}>✓</span>}
                          </div>
                          {index < progressSteps.length - 1 && (
                            <div className={`${styles.progressLine} ${isCompleted && currentStep >= item.step + 1 ? styles.progressLineCompleted : ''}`} />
                          )}
                        </div>
                        <div className={styles.progressStepText}>
                          <span className={styles.progressStepLabel}>{item.label}</span>
                          <span className={styles.progressStepDate}>
                            {isCompleted ? formatDateTime(order.createdAt._seconds) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Price Cards */}
            <div className={styles.priceCardsGrid}>
              <div className={styles.priceCard}>
                <span className={styles.priceLabel}>{t("shippingPrice")}</span>
                <span className={styles.priceValue}>{order.shippingAmount} {tCommon("currency")}</span>
              </div>
              <div className={styles.priceCard}>
                <span className={styles.priceLabel}>{t("packagePrice")}</span>
                <span className={styles.priceValue}>{order.cash} {tCommon("currency")}</span>
              </div>
              {order.type === "PREPAID" && order.otp && (
                <div className={styles.priceCardOtp}>
                  <span className={styles.priceLabel}>{t("otpCode")}</span>
                  <span className={styles.otpValue}>{order.otp}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps Section for PENDING */}
        {canShowMap() && (
          <div className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <h3 className={styles.mapTitle}>{t("mapTitle")}</h3>
              <p className={styles.mapDescription}>
                {t("mapDescription")}
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

        {/* Courier & Order Details Section - Show when courier is assigned */}
        {order.selectedCourier && (
          <div className={styles.courierOrderSection}>
            {/* Courier Card (right in RTL) */}
            <div className={styles.courierCard}>
              <div className={styles.courierHeader} onClick={() => order.selectedCourier && handleViewCourierProfile(order.selectedCourier.id)} style={{ cursor: "pointer" }}>
                <div className={styles.courierInfo}>
                  <h3 className={styles.courierName}>{order.selectedCourier.name}</h3>
                  <div className={styles.courierMeta}>
                    <span className={styles.courierRating}>{order.selectedCourier.rating} ⭐</span>
                  </div>
                  <span className={styles.courierSuccessCount}>
                    {order.selectedCourier.successCount} {t("successfulOrders")}
                  </span>
                </div>
                <div className={styles.courierAvatarLarge}>
                  <Image
                    src={order.selectedCourier.avatar || "/icons/User.svg"}
                    alt={order.selectedCourier.name}
                    width={70}
                    height={70}
                  />
                </div>
              </div>

              <div className={styles.courierContactButtons}>
                <a href={`tel:${order.selectedCourier.phone}`} className={styles.contactBtn}>
                  <span className={styles.contactIcon}>📞</span>
                </a>
                <button
                  className={styles.contactBtn}
                  onClick={() => {
                    if (order.selectedCourier) {
                      window.dispatchEvent(new CustomEvent("openChatWithUser", {
                        detail: {
                          userId: order.selectedCourier.id,
                          name: order.selectedCourier.name,
                          avatar: order.selectedCourier.avatar || "/icons/User.svg",
                        }
                      }));
                    }
                  }}
                >
                  <Image src="/icons/Chat.svg" alt={t("courierSection.message")} width={20} height={20} />
                </button>
              </div>

              <div className={styles.courierDetailsGrid}>
                <div className={styles.courierDetailRow}>
                  <span className={styles.courierDetailLabel}>{t("deliveryMethod")}</span>
                  <span className={styles.courierDetailValue}>{getDeliveryMethodLabel(order.selectedCourier.method)}</span>
                </div>
              </div>

              <div className={styles.courierActions}>
                {order.receiveOTP && order.status !== "COMPLETED" && order.status !== "DELIVERED" && (
                  <button
                    className={styles.showCodeBtn}
                    onClick={() => setShowReceiveCodeModal(true)}
                  >
                    {t("courierSection.showReceiveCode")}
                  </button>
                )}
                {(order.status === "PENDING_COURIER" || order.status === "RECEIVED") && (
                  <button
                    className={styles.cancelOrderBtn}
                    onClick={() => setShowCancelModal(true)}
                    disabled={processingAction}
                  >
                    <span>✕</span>
                    {t("cancelOrder")}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Merchant/Order Details Card - Always visible */}
        <div className={styles.orderDetailsCard}>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>{t("courierSection.pickupAddress")}</span>
            <span className={styles.orderDetailValue}>{order.pickup.title}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>{t("courierSection.customerName")}</span>
            <span className={styles.orderDetailValue}>{order.customer.name}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>{t("courierSection.customerPhone")}</span>
            <span className={styles.orderDetailValue}>{order.customer.phone}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>{t("courierSection.customerAddress")}</span>
            <span className={styles.orderDetailValue}>{order.customer.address}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>{t("courierSection.city")}</span>
            <span className={styles.orderDetailValue}>{order.customer.gov}</span>
          </div>
        </div>

{/* Offers Section - Only show for PENDING status */}
        {order.status === "PENDING" && (
        <div className={styles.offersSection}>
          <div className={styles.offersSectionHeader}>
            <h2 className={styles.offersTitle}>
              {t("bidsTitle")} ({bids.length.toString().padStart(2, "0")})
            </h2>
            <span className={styles.viewAll}>{t("viewAll")}</span>
          </div>

          <div className={styles.offersList}>
            {bids.length === 0 ? (
              <div className={styles.emptyState}>{t("noBids")}</div>
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
                            {bid.courier.successCount} {t("successfulOrders")}
                          </span>
                          <span className={styles.runnerRating}>
                            {bid.courier.rating} ⭐
                          </span>
                        </div>
                      </div>
                      <div className={styles.offerDetailsRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>{t("suggestedPrice")}</span>
                          <span className={styles.detailValue}>{bid.amount} {tCommon("currency")}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>{t("bidDate")}</span>
                          <span className={styles.detailValue}>
                            {formatDate(bid.createdAt._seconds)}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>{t("deliveryMethod")}</span>
                          <span className={styles.detailValue}>{getDeliveryMethodLabel(bid.courier.method)}</span>
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
                            {processingBid === bid.id ? t("processing") : t("acceptBid")}
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={processingBid === bid.id}
                          >
                            <span>✕</span>
                            {t("rejectBid")}
                          </button>
                        </div>
                      )}
                      {bid.status !== "PENDING" && (
                        <div className={styles.bidStatusBadge}>
                          {bid.status === "ACCEPTED" ? t("acceptedBid") : t("rejectedBid")}
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
            <div className={styles.cancelModal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.cancelModalTitle}>{t("cancelOrderModal.title")}</h2>
              <p className={styles.cancelModalSubtitle}>{t("cancelOrderModal.subtitle")}</p>

              <div className={styles.cancelModalField}>
                <label className={styles.cancelModalLabel}>{t("cancelOrderModal.reasonLabel")}</label>
                <div className={styles.cancelSelectWrapper}>
                  <select
                    className={styles.cancelSelect}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="">{t("cancelOrderModal.reasonPlaceholder")}</option>
                    <option value="courier_requested">{t("cancelOrderModal.reasons.courierRequested")}</option>
                    <option value="order_info_error">{t("cancelOrderModal.reasons.orderInfoError")}</option>
                    <option value="courier_late">{t("cancelOrderModal.reasons.courierLate")}</option>
                    <option value="delivered_other">{t("cancelOrderModal.reasons.deliveredOther")}</option>
                    <option value="other">{t("cancelOrderModal.reasons.other")}</option>
                  </select>
                  <span className={styles.cancelSelectArrow}>&#8249;</span>
                </div>
              </div>

              <div className={styles.cancelModalField}>
                <label className={styles.cancelModalLabel}>{t("cancelOrderModal.explainLabel")}</label>
                <textarea
                  className={styles.cancelTextarea}
                  placeholder={t("cancelOrderModal.explainPlaceholder")}
                  value={cancelExplain}
                  onChange={(e) => setCancelExplain(e.target.value)}
                  rows={5}
                />
              </div>

              <div className={styles.cancelModalFooter}>
                <button
                  className={styles.cancelBackBtn}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setCancelExplain("");
                  }}
                >
                  {t("cancelOrderModal.back")}
                </button>
                <button
                  className={styles.cancelSubmitBtn}
                  onClick={handleCancelOrder}
                  disabled={processingAction}
                >
                  {processingAction ? t("processingCancel") : t("cancelOrderModal.submit")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal - commented out for now */}
        {/* {showCancelConfirm && (
          <div className={styles.modalOverlay} onClick={() => setShowCancelConfirm(false)}>
            <div className={styles.cancelConfirmModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.cancelConfirmIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.cancelConfirmTitle}>{t("cancelConfirmModal.title")}</h2>
              <p className={styles.cancelConfirmHint}>{t("cancelConfirmModal.hint")}</p>
              <div className={styles.cancelModalFooter}>
                <button
                  className={styles.cancelBackBtn}
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setShowCancelModal(true);
                  }}
                >
                  {t("cancelConfirmModal.back")}
                </button>
                <button
                  className={styles.cancelSubmitBtn}
                  onClick={handleCancelConfirm}
                  disabled={processingAction}
                >
                  {processingAction ? t("processingCancel") : t("cancelConfirmModal.confirm")}
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Wallet Top-up Modal - commented out for now */}
        {/* {showWalletModal && (
          <div className={styles.modalOverlay} onClick={() => setShowWalletModal(false)}>
            <div className={styles.cancelConfirmModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.walletModalIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M21 7H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#fff"/>
                  <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.cancelConfirmTitle}>{t("walletModal.title")}</h2>
              <p className={styles.cancelConfirmHint}>{t("walletModal.hint")}</p>
              <div className={styles.cancelModalFooter}>
                <button
                  className={styles.cancelBackBtn}
                  onClick={() => {
                    setShowWalletModal(false);
                    setCancelReason("");
                    setCancelExplain("");
                  }}
                >
                  {t("walletModal.back")}
                </button>
                <button
                  className={styles.cancelSubmitBtn}
                  onClick={() => {
                    setShowWalletModal(false);
                    setCancelReason("");
                    setCancelExplain("");
                    router.push("/transaction");
                  }}
                >
                  {t("walletModal.chargeWallet")}
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Mark as Returned Modal */}
        {showReturnModal && (
          <div className={styles.modalOverlay} onClick={() => setShowReturnModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{t("returnModal.title")}</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowReturnModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalHint}>
                  {t("returnModal.hint")}
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => {
                    setShowReturnModal(false);
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleMarkAsReturned}
                  disabled={processingAction}
                >
                  {processingAction ? t("processingReturn") : t("confirmReturn")}
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
                <h3 className={styles.modalTitle}>{t("ratingModal.title")}</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowRatingModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.modalLabel}>{t("ratingModal.ratingLabel")}</label>
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
                  {t("ratingModal.commentLabel")}
                </label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder={t("ratingModal.placeholder")}
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
                  {t("common.cancel")}
                </button>
                <button
                  className={styles.modalConfirmBtn}
                  onClick={handleSubmitRating}
                  disabled={processingAction}
                >
                  {processingAction ? t("processingRating") : t("submitRating")}
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
                <h3 className={styles.modalTitle}>{t("qrModal.title")}</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowQRModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <QRCodeDisplay data={order.qrCode} />
                <p className={styles.qrCodeHint}>{t("qrModal.hint")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Receive Code Modal */}
        {showReceiveCodeModal && (
          <div className={styles.modalOverlay} onClick={() => setShowReceiveCodeModal(false)}>
            <div className={styles.codeModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.codeModalBody}>
                <h2 className={styles.codeModalTitle}>{t("courierSection.receiveCodeTitle")}</h2>
                <p className={styles.codeModalHint}>{t("courierSection.receiveCodeHint")}</p>
                <div className={styles.codeModalValue}>
                  {order.receiveOTP || '--'}
                </div>
              </div>
              <button
                className={styles.codeModalBtn}
                onClick={() => setShowReceiveCodeModal(false)}
              >
                {t("courierSection.returnBtn")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

