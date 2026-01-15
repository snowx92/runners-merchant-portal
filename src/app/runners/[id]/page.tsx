"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/runners/runnerDetails.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { courierService, orderService } from "@/lib/api/services";
import type { CourierProfile, CourierReview } from "@/lib/api/types/courier.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function RunnerDetails() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courierId = params.id as string;
  const bidId = searchParams.get("bidId");
  const orderId = searchParams.get("orderId");

  const [courier, setCourier] = useState<CourierProfile | null>(null);
  const [reviews, setReviews] = useState<CourierReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBid, setProcessingBid] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourierData = async () => {
      try {
        setLoading(true);
        const [profileRes, reviewsRes] = await Promise.allSettled([
          courierService.getCourierProfile(courierId),
          courierService.getCourierReviews(courierId, 1, 10),
        ]);

        console.log("👤 Courier Profile Response:", profileRes);
        console.log("⭐ Reviews Response:", reviewsRes);

        if (profileRes.status === "fulfilled" && profileRes.value) {
          console.log("✅ Courier Profile Data:", profileRes.value);
          setCourier(profileRes.value as unknown as CourierProfile);
        }

        if (reviewsRes.status === "fulfilled" && reviewsRes.value) {
          console.log("✅ Reviews Data:", reviewsRes.value);
          const reviewsData = reviewsRes.value as unknown as { items: CourierReview[]; isLastPage: boolean };
          setReviews(reviewsData.items);
        }
      } catch (error) {
        console.error("Error fetching courier data:", error);
        alert("فشل في تحميل بيانات المندوب");
      } finally {
        setLoading(false);
      }
    };

    fetchCourierData();
  }, [courierId]);

  const handleConfirmOrder = async () => {
    if (!bidId || !orderId) {
      alert("معلومات الطلب غير متوفرة");
      return;
    }

    if (!window.confirm("هل أنت متأكد من قبول هذا العرض؟")) return;

    try {
      setProcessingBid(true);
      await orderService.updateBid(bidId, {
        orderId: orderId,
        status: "ACCEPTED",
      });
      alert("تم قبول العرض بنجاح");
      router.back();
    } catch (error) {
      console.error("Error accepting bid:", error);
      alert("فشل في قبول العرض");
    } finally {
      setProcessingBid(false);
    }
  };

  const handleAddReview = async () => {
    if (!reviewText.trim()) {
      alert("الرجاء كتابة التقييم");
      return;
    }

    try {
      setSubmittingReview(true);
      await courierService.addCourierReview(courierId, {
        stars: reviewStars,
        review: reviewText,
      });
      alert("تم إضافة التقييم بنجاح");
      setShowReviewModal(false);
      setReviewText("");
      setReviewStars(5);

      // Refresh reviews
      const reviewsRes = await courierService.getCourierReviews(courierId, 1, 10);
      if (reviewsRes) {
        const reviewsData = reviewsRes as unknown as { items: CourierReview[] };
        setReviews(reviewsData.items);
      }
    } catch (error) {
      console.error("Error adding review:", error);
      alert("فشل في إضافة التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCall = () => {
    if (courier?.phoneNumber) {
      window.location.href = `tel:${courier.phoneNumber}`;
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Image
        key={i}
        src="/icons/star.svg"
        alt="star"
        width={16}
        height={16}
        className={styles.star}
      />
    ));
  };

  const formatTimeAgo = (createdAt: string | { _seconds: number; _nanoseconds: number } | undefined) => {
    if (!createdAt) {
      return "منذ لحظات";
    }

    let date: Date;
    if (typeof createdAt === "string") {
      date = new Date(createdAt);
    } else if (createdAt._seconds) {
      date = new Date(createdAt._seconds * 1000);
    } else {
      return "منذ لحظات";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `منذ ${diffDays} يوماً و${diffHours} ساعات`;
    } else if (diffHours > 0) {
      return `منذ ${diffHours} ساعات`;
    } else {
      return "منذ لحظات";
    }
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

  if (!courier) {
    return (
      <main className={`${styles.mainContainer} ${cairo.className}`}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.emptyState}>لم يتم العثور على بيانات المندوب</div>
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
          <span className={styles.backArrow} onClick={() => router.back()}>
            →
          </span>
          <h1 className={styles.pageTitle}>تفاصيل المورد</h1>
          {bidId && orderId && (
            <button
              className={styles.confirmButton}
              onClick={handleConfirmOrder}
              disabled={processingBid}
            >
              <span className={styles.buttonIcon}>💬</span>
              {processingBid ? "جاري التأكيد..." : "تأكيد الطلب"}
            </button>
          )}
        </div>

        {/* Runner Profile Section */}
        <div className={styles.profileSection}>
          {/* Stats Cards */}
          <div className={styles.statsCards}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>الطلبات المكتملة</span>
              <span className={styles.statValue}>{courier.counters.success} طلب</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>معدل القبول</span>
              <span className={styles.statValue}>{courier.counters.accepted_bids}</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileContent}>
              <div className={styles.profileTextSection}>
                <h2 className={styles.runnerName}>{courier.fullName}</h2>
                <p className={styles.runnerBio}>
                  مندوب توصيل {courier.verified ? "موثق" : "غير موثق"} • {courier.deliveryMethod === "WALKING" ? "سيراً على الأقدام" : courier.deliveryMethod === "BICYCLE" ? "دراجة هوائية" : courier.deliveryMethod === "MOTORCYCLE" ? "دراجة نارية" : "سيارة"}
                </p>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.confirmButtonBottom}
                    onClick={() => setShowReviewModal(true)}
                  >
                    <span className={styles.buttonIcon}>⭐</span>
                    إضافة تقييم
                  </button>
                  <button className={styles.callButton} onClick={handleCall}>
                    <span className={styles.buttonIcon}>📞</span>
                    اتصل الان
                  </button>
                </div>
              </div>
              <div className={styles.profileImageWrapper}>
                <Image
                  src={courier.avatar || "/icons/User.svg"}
                  alt={courier.fullName}
                  width={150}
                  height={150}
                  className={styles.profileImage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>التقييمات السابقة</h2>
            <span className={styles.viewAll}>عرض الكل</span>
          </div>

          {reviews.length === 0 ? (
            <div className={styles.emptyState}>لا توجد تقييمات حتى الآن</div>
          ) : (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        <Image
                          src="/icons/User.svg"
                          alt="reviewer"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className={styles.reviewerDetails}>
                        <h3 className={styles.reviewerName}>تاجر</h3>
                        <span className={styles.reviewTime}>
                          {formatTimeAgo(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderStars()}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>إضافة تقييم</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.starsSelector}>
                <label className={styles.inputLabel}>التقييم</label>
                <div className={styles.starsInput}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={styles.starButton}
                      onClick={() => setReviewStars(star)}
                    >
                      <span style={{ color: star <= reviewStars ? "#FFD700" : "#E0E0E0", fontSize: "32px" }}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>التقييم</label>
                <textarea
                  className={styles.textareaInput}
                  rows={5}
                  placeholder="اكتب تقييمك هنا..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowReviewModal(false)}
                >
                  إلغاء
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleAddReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
