"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/orderDetails.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

interface RunnerOffer {
  id: string;
  runnerName: string;
  runnerImage: string;
  rating: number;
  completedOrders: number;
  deliveryPrice: number;
  estimatedTime: string;
  deliveryMethod: string;
}

export default function OrderDetails() {
  const router = useRouter();

  // Static mock data
  const order = {
    id: "1",
    title: "كاميرا رقمية",
    description: "كاميرا رقمية عالية الجودة مع حقيبة حمل",
    packagePrice: 14563,
    deliveryPrice: 50,
    status: "جديد",
    date: "2025/01/11",
    image: "/icons/Camera.svg",
  };

  const runnerOffers: RunnerOffer[] = [
    {
      id: "1",
      runnerName: "محمد الأحمد",
      runnerImage: "/icons/User.svg",
      rating: 4.5,
      completedOrders: 120,
      deliveryPrice: 50,
      estimatedTime: "3 ساعات",
      deliveryMethod: "دراجة نارية",
    },
    {
      id: "2",
      runnerName: "محمد الأحمد",
      runnerImage: "/icons/User.svg",
      rating: 4.5,
      completedOrders: 120,
      deliveryPrice: 50,
      estimatedTime: "3 ساعات",
      deliveryMethod: "دراجة نارية",
    },
    {
      id: "3",
      runnerName: "محمد الأحمد",
      runnerImage: "/icons/User.svg",
      rating: 4.5,
      completedOrders: 120,
      deliveryPrice: 50,
      estimatedTime: "3 ساعات",
      deliveryMethod: "دراجة نارية",
    },
    {
      id: "4",
      runnerName: "محمد الأحمد",
      runnerImage: "/icons/User.svg",
      rating: 4.5,
      completedOrders: 120,
      deliveryPrice: 50,
      estimatedTime: "3 ساعات",
      deliveryMethod: "دراجة نارية",
    },
  ];

  const handleAcceptOffer = (offerId: string) => {
    console.log("Accept offer:", offerId);
  };

  const handleRejectOffer = (offerId: string) => {
    console.log("Reject offer:", offerId);
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            تفاصيل الطلب
            <span className={styles.backArrow} onClick={() => router.back()}>
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
              <span className={styles.priceValue}>{order.packagePrice} جنيه</span>
            </div>
            <div className={styles.priceCard}>
              <span className={styles.priceLabel}>سعر التوصيل</span>
              <span className={styles.priceValue}>{order.deliveryPrice} جنيه</span>
            </div>
          </div>

          {/* Order Info Card - Left Half */}
          <div className={styles.orderInfoCard}>
            <div className={styles.orderTop}>
              <span className={styles.orderDate}>{order.date}</span>
              <span className={styles.statusBadge}>{order.status}</span>
            </div>

            <div className={styles.orderMain}>
              <div className={styles.orderTextContent}>
                <h2 className={styles.orderTitle}>{order.title}</h2>
                <p className={styles.orderDescription}>{order.description}</p>
              </div>
              <div className={styles.orderImageWrapper}>
                <Image
                  src={order.image}
                  alt={order.title}
                  width={150}
                  height={150}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Offers Section */}
        <div className={styles.offersSection}>
          <div className={styles.offersSectionHeader}>
            <h2 className={styles.offersTitle}>
              العروض المقدمة ({runnerOffers.length.toString().padStart(2, "0")})
            </h2>
            <span className={styles.viewAll}>عرض الكل</span>
          </div>

          <div className={styles.offersList}>
            {runnerOffers.map((offer) => (
              <div key={offer.id} className={styles.offerCard}>
                <div className={styles.offerContent}>
                  <div className={styles.runnerRow}>
                    <div
                      className={styles.runnerAvatar}
                      onClick={() => router.push(`/runners/${offer.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Image
                        src={offer.runnerImage}
                        alt={offer.runnerName}
                        width={60}
                        height={60}
                      />
                    </div>
                    <div
                      className={styles.runnerInfo}
                      onClick={() => router.push(`/runners/${offer.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h3 className={styles.runnerName}>{offer.runnerName}</h3>
                      <div className={styles.runnerMeta}>
                        <span className={styles.runnerOrders}>
                          {offer.completedOrders} عملية ناجحة
                        </span>
                        <span className={styles.runnerRating}>
                          {offer.rating} ⭐
                        </span>
                      </div>
                    </div>
                    <div className={styles.offerDetailsRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>سعر التوصيل المقترح</span>
                        <span className={styles.detailValue}>{offer.deliveryPrice} جنيه</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>وقت التوصيل المتوقع</span>
                        <span className={styles.detailValue}>{offer.estimatedTime}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>طريقة التوصيل</span>
                        <span className={styles.detailValue}>{offer.deliveryMethod}</span>
                      </div>
                    </div>
                    <div className={styles.offerButtons}>
                      <button
                        className={styles.acceptBtn}
                        onClick={() => handleAcceptOffer(offer.id)}
                      >
                        <span>✓</span>
                        قبول العرض
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleRejectOffer(offer.id)}
                      >
                        <span>✕</span>
                        رفض العرض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
