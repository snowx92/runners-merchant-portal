
import Image from "next/image";
import styles from "@/styles/home/home.module.css";

export const StatsRow = () => {
    return (
        <>
            <h3 className={styles.sectionTitle} style={{ textAlign: 'right' }}>احصائيات</h3>
            <div className={styles.statsGrid}>
                {/* Card 1: Active Orders (Rightmost) */}
                <div className={styles.statCard} dir="rtl">
                    <div className={styles.statIconLarge}>
                        <Image src="/icons/Box.svg" alt="Active Orders" width={48} height={48} style={{ filter: 'brightness(0)' }} />
                    </div>
                    <div className={styles.statInfo} style={{textAlign: 'right'}} dir="rtl">
                        <span className={styles.statValue}>5 طلبات</span>
                        <span className={styles.statLabel}>الطلبات النشطة</span>
                    </div>
                </div>
                {/* Card 2: Completed Orders (Middle) */}
                <div className={styles.statCard} dir="rtl">
                    <div className={styles.statIconLarge}>
                        <Image src="/icons/mark.svg" alt="Completed Orders" width={48} height={48} style={{ filter: 'brightness(0)' }} />
                    </div>
                    <div className={styles.statInfo} style={{textAlign: 'right'}} dir="rtl">
                        <span className={styles.statValue}>5 طلبات</span>
                        <span className={styles.statLabel}>الطلبات المكتملة</span>
                    </div>
                </div>
                {/* Card 3: Profit (Leftmost) */}
                <div className={styles.statCard} dir="rtl">
                    <div className={styles.statIconLarge}>
                        <Image src="/icons/vector.svg" alt="Profit" width={48} height={48} style={{ filter: 'brightness(0)' }} />
                    </div>
                    <div className={styles.statInfo} style={{textAlign: 'right'}} dir="rtl">
                        <span className={styles.statValue}>52.321 جنيه</span>
                        <span className={styles.statLabel}>صافي الأرباح</span>
                    </div>
                </div>
            </div>
        </>
    );
};
