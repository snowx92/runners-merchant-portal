import styles from "@/styles/home/home.module.css";

export const HeroBanner = () => {
    return (
        <div className={styles.heroCard}>
            <div className={styles.heroContent}>
                <h2 className={styles.heroTitle}>هذا النص هو مثال</h2>
                <p className={styles.heroSubtitle}>هذا النص هو مثال لنص يمكن أن يستبدل</p>
                <button className={styles.heroButton}>اكتشف الآن</button>
            </div>
            {/* Dots */}
        </div>
    );
};

export const PaginationDots = () => (
    <div className={styles.paginationDots}>
        <div className={styles.dot} />
        <div className={`${styles.dot} ${styles.dotActive}`} />
        <div className={styles.dot} />
    </div>
);
