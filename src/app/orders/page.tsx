"use client";

import { Navbar } from "@/components/home/Navbar";
import styles from "@/styles/orders/orders.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

type OrderStatus = "all" | "pending" | "delivered" | "completed" | "cancelled";

interface Order {
  id: string;
  title: string;
  subtitle: string;
  status: Exclude<OrderStatus, "all">;
}

const mockOrders: Order[] = [
  { id: "1", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "pending" },
  { id: "2", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "delivered" },
  { id: "3", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "completed" },
  { id: "4", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "cancelled" },
  { id: "5", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "pending" },
  { id: "6", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "delivered" },
  { id: "7", title: "هذا النص هو مثال", subtitle: "فيصل، محدد على", status: "completed" },
];

export default function Orders() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusLabel = (status: Exclude<OrderStatus, "all">) => {
    const labels = {
      pending: "قيد التسليم",
      delivered: "جديد",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return labels[status];
  };

  const getStatusClass = (status: Exclude<OrderStatus, "all">) => {
    return styles[`badge${status.charAt(0).toUpperCase()}${status.slice(1)}`];
  };

  const filteredOrders = mockOrders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery && !order.title.includes(searchQuery)) return false;
    return true;
  });

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* First Row: Title on right, Toggle Buttons on left */}
        <div className={styles.headerRow}>
          <div className={styles.toggleContainer}>
            <button
              className={styles.toggleButton}
              onClick={() => router.push("/orders/bulk")}
            >
           انشاء طلب مجمع
            </button>
            <button
              className={styles.toggleButton}
              onClick={() => router.push("/orders/add")}
            >
              انشاء طلب جديد
            </button>
          </div>
          <h1 className={styles.pageTitle}>الطلبات</h1>
        </div>

        {/* Second Row: Search bar with filter button on left */}
        <div className={styles.searchSection}>
          <button className={styles.filterButton}>
            <Image src="/icons/Filter.svg" alt="Filter" width={20} height={20} />
          </button>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ادخل اسم المنتج هنا"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className={styles.statusTabs}>
          <button
            className={`${styles.statusTab} ${
              statusFilter === "completed" ? styles.statusTabActive : ""
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            مكتمل
          </button>
          <button
            className={`${styles.statusTab} ${
              statusFilter === "delivered" ? styles.statusTabActive : ""
            }`}
            onClick={() => setStatusFilter("delivered")}
          >
            قيد التسليم
          </button>
          <button
            className={`${styles.statusTab} ${
              statusFilter === "pending" ? styles.statusTabActive : ""
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            جديد
          </button>
          <button
            className={`${styles.statusTab} ${
              statusFilter === "all" ? styles.statusTabActive : ""
            }`}
            onClick={() => setStatusFilter("all")}
          >
            الكل
          </button>
        </div>

        {/* Orders List */}
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={styles.orderCard}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className={styles.orderBadge}>
                <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className={styles.orderInfo}>
                <h3 className={styles.orderTitle}>{order.title}</h3>
                <p className={styles.orderSubtitle}>{order.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
