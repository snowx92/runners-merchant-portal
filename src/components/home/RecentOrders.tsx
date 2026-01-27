"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "@/styles/home/home.module.css";
import type { Order } from "@/lib/api/types/home.types";

interface RecentOrdersProps {
  orders: Order[];
}

// Status className mapping
const getStatusClassName = (status: string) => {
  const classMap: Record<string, string> = {
    PENDING: styles.badgePending,
    ACCEPTED: styles.badgeNew,
    PICKED_UP: styles.badgePending,
    DELIVERED: styles.badgeNew,
    COMPLETED: styles.badgeCompleted,
    CANCELLED: styles.badgeCancelled,
    FAILED: styles.badgeCancelled,
    RETURNED: styles.badgeCancelled,
  };

  return classMap[status] || styles.badgePending;
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(price);
};

export const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const t = useTranslations("home");
  const tOrders = useTranslations("orders");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className={styles.ordersHeader}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          {t("recentOrders")}
        </h3>
        <Link href="/orders" className={styles.viewAll}>
          {t("viewAll")}
        </Link>
      </div>

      <div className={styles.ordersList}>
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const statusClassName = getStatusClassName(order.status);
            const statusKey = order.status.toLowerCase() as
              | "pending"
              | "accepted"
              | "picked_up"
              | "delivered"
              | "completed"
              | "cancelled"
              | "failed"
              | "returned";

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={styles.orderLink} // optional
              >
                <div className={styles.orderCard}>
                  {/* Order Info */}
                  <div
                    className={styles.orderInfo}
                    style={{ textAlign: "right" }}
                  >
                    <span className={styles.orderTitle}>
                      {tOrders("orderNumber", { id: order.id })}
                    </span>
                    <span className={styles.orderSub}>
                      {tOrders("customer")}: {order.customer.name} •{" "}
                      {formatPrice(order.cash)} {tCommon("currency")}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`${styles.badge} ${statusClassName}`}>
                    {tOrders(`status.${statusKey}`)}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#999",
            }}
          >
            {t("noOrders")}
          </div>
        )}
      </div>
    </>
  );
};
