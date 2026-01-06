import styles from "@/styles/home/home.module.css";

const orders = [
    { id: 1, title: 'هذا النص هو مثال', sub: 'العميل : محمد علي', status: 'pending', statusText: 'قيد التنفيذ' },
    { id: 2, title: 'هذا النص هو مثال', sub: 'العميل : محمد علي', status: 'new', statusText: 'جديد' },
    { id: 3, title: 'هذا النص هو مثال', sub: 'العميل : محمد علي', status: 'completed', statusText: 'مكتمل' },
];

export const RecentOrders = () => {
    return (
        <>
            <div className={styles.ordersHeader}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>الطلبات الحديثة</h3>
                <span className={styles.viewAll}>عرض الكل</span>
            </div>
            <div className={styles.ordersList}>
                {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                        {/* Text Info - First in DOM = Right/Start in RTL */}
                        <div className={styles.orderInfo} style={{ textAlign: 'right' }}>
                            <span className={styles.orderTitle}>{order.title}</span>
                            <span className={styles.orderSub}>{order.sub}</span>
                        </div>

                        {/* Badge - Second in DOM = Left/End in RTL */}
                        <span className={`${styles.badge} ${order.status === 'pending' ? styles.badgePending :
                            order.status === 'new' ? styles.badgeNew : styles.badgeCompleted
                            }`}>
                            {order.statusText}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
};
