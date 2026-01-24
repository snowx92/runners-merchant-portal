import Link from "next/link";
import styles from "@/styles/home/home.module.css";
import type { Order } from "@/lib/api/types/home.types";

interface RecentOrdersProps {
  orders: Order[];
}

// Status mapping from English to Arabic
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { text: string; className: string }> = {
    PENDING: { text: "قيد الانتظار", className: styles.badgePending },
    ACCEPTED: { text: "مقبول", className: styles.badgeNew },
    PICKED_UP: { text: "تم الاستلام", className: styles.badgePending },
    DELIVERED: { text: "تم التوصيل", className: styles.badgeNew },
    COMPLETED: { text: "مكتمل", className: styles.badgeCompleted },
    CANCELLED: { text: "ملغي", className: styles.badgeCancelled },
    FAILED: { text: "فشل", className: styles.badgeCancelled },
    RETURNED: { text: "مرتجع", className: styles.badgeCancelled },
  };

  return statusMap[status] || {
    text: status,
    className: styles.badgePending,
  };
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
  return (
    <>
      <div className={styles.ordersHeader}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          الطلبات الحديثة
        </h3>
        <Link href="/orders" className={styles.viewAll}>
          عرض الكل
        </Link>
      </div>

      <div className={styles.ordersList}>
        {orders && orders.length > 0 ? (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);

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
                      طلب #{order.id}
                    </span>
                    <span className={styles.orderSub}>
                      العميل: {order.customer.name} •{" "}
                      {formatPrice(order.cash)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`${styles.badge} ${statusInfo.className}`}
                  >
                    {statusInfo.text}
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
            لا توجد طلبات حديثة
          </div>
        )}
      </div>
    </>
  );
};
