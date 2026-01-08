"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/runners/runnerDetails.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

interface Review {
  id: string;
  reviewerName: string;
  reviewerImage: string;
  rating: number;
  timeAgo: string;
  comment: string;
}

export default function RunnerDetails() {
  const router = useRouter();

  // Static mock data
  const runner = {
    id: "1",
    name: "احمد ابراهيم",
    image: "/icons/User.svg",
    bio: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى",
    totalOrders: 425,
    rating: 90,
  };

  const reviews: Review[] = [
    {
      id: "1",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و5 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
    {
      id: "2",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و5 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
    {
      id: "3",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و10 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
    {
      id: "4",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و5 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
    {
      id: "5",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و10 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
    {
      id: "6",
      reviewerName: "محمد الاحمد",
      reviewerImage: "/icons/User.svg",
      rating: 5,
      timeAgo: "منذ 12 يوماً و5 ساعات",
      comment: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.",
    },
  ];

  const renderStars = (rating: number) => {
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
          <button className={styles.confirmButton}>
            <span className={styles.buttonIcon}>💬</span>
            تأكيد الطلب
          </button>
        </div>

        {/* Runner Profile Section */}
        <div className={styles.profileSection}>
          {/* Stats Cards */}
          <div className={styles.statsCards}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>الطلبات المكتملة</span>
              <span className={styles.statValue}>{runner.totalOrders} طلب</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>معدل القبول</span>
              <span className={styles.statValue}>{runner.rating}%</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileContent}>
              <div className={styles.profileTextSection}>
                <h2 className={styles.runnerName}>{runner.name}</h2>
                <p className={styles.runnerBio}>{runner.bio}</p>
                <div className={styles.buttonGroup}>
                  <button className={styles.confirmButtonBottom}>
                    <span className={styles.buttonIcon}>💬</span>
                    تأكيد الطلب
                  </button>
                  <button className={styles.callButton}>
                    <span className={styles.buttonIcon}>📞</span>
                    اتصل الان
                  </button>
                </div>
              </div>
              <div className={styles.profileImageWrapper}>
                <Image
                  src={runner.image}
                  alt={runner.name}
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

          <div className={styles.reviewsGrid}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      <Image
                        src={review.reviewerImage}
                        alt={review.reviewerName}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className={styles.reviewerDetails}>
                      <h3 className={styles.reviewerName}>{review.reviewerName}</h3>
                      <span className={styles.reviewTime}>{review.timeAgo}</span>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
