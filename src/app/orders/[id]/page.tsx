"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/orderDetails.module.css";
import { Cairo } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { orderService } from "@/lib/api/services";
import type { OrderBid } from "@/lib/api/types/order.types";
import Image from "next/image";

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
    name: string;
    avatar: string;
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

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [bids, setBids] = useState<BidWithCourier[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBid, setProcessingBid] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderRes, bidsRes] = await Promise.allSettled([
        orderService.getSingleOrder(orderId),
        orderService.getOrderBids(orderId),
      ]);

      console.log("📦 Order Response:", orderRes);
      console.log("🎯 Bids Response:", bidsRes);

      if (orderRes.status === "fulfilled" && orderRes.value) {
        // ApiService already returns unwrapped data (just the data property)
        console.log("✅ Order Data:", orderRes.value);
        setOrder(orderRes.value as unknown as OrderDetails);
      } else if (orderRes.status === "rejected") {
        console.error("❌ Order fetch failed:", orderRes.reason);
      }

      if (bidsRes.status === "fulfilled" && bidsRes.value) {
        // ApiService already returns unwrapped data (just the data property)
        console.log("✅ Bids Data:", bidsRes.value);
        setBids(bidsRes.value as unknown as BidWithCourier[]);
      } else if (bidsRes.status === "rejected") {
        console.error("❌ Bids fetch failed:", bidsRes.reason);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
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

      // Refresh order details and bids
      await fetchOrderDetails();
      alert("تم قبول العرض بنجاح");
    } catch (error) {
      console.error("Error accepting bid:", error);
      alert("فشل في قبول العرض");
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

      // Refresh bids
      const bidsRes = await orderService.getOrderBids(orderId);
      if (bidsRes) {
        // ApiService already returns unwrapped data
        setBids(bidsRes as unknown as BidWithCourier[]);
      }
      alert("تم رفض العرض بنجاح");
    } catch (error) {
      console.error("Error rejecting bid:", error);
      alert("فشل في رفض العرض");
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "جديد",
      ACCEPTED: "مقبول",
      PICKED_UP: "تم الاستلام",
      DELIVERED: "قيد التسليم",
      COMPLETED: "مكتمل",
      CANCELLED: "ملغي",
      FAILED: "فشل",
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
          <h1 className={styles.pageTitle}>
            تفاصيل الطلب #{order.id}
            <span className={styles.backArrow} onClick={() => router.push("/orders")}>
              →
            </span>
          </h1>
        </div>

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
          </div>

          {/* Order Info Card - Left Half */}
          <div className={styles.orderInfoCard}>
            <div className={styles.orderTop}>
              <span className={styles.orderDate}>{formatDate(order.createdAt._seconds)}</span>
              <span className={styles.statusBadge}>{getStatusLabel(order.status)}</span>
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

        {/* Offers Section */}
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
      </div>
    </main>
  );
}
