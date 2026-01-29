import type { HomeAnalytics } from "@/lib/api/types/home.types";
import styles from "@/styles/home/home.module.css";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

interface StatsRowProps {
  analytics: HomeAnalytics | null;
}

export const StatsRow = ({ analytics }: StatsRowProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  // Format number with thousands separator based on locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  return (
    <>
      <h3
        className={styles.sectionTitle}
        style={{ textAlign: isRTL ? "right" : "left" }}
      >
        {t("statsTitle")}
      </h3>
      <div className={styles.statsGrid}>
        {/* Card 1: Active Orders -> /orders?status=PENDING */}
        <Link
          href="/orders?status=PENDING"
          className={styles.statCard}
          style={{
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className={styles.statIconLarge}>
            <Image
              src="/icons/Box.svg"
              alt="Active Orders"
              width={48}
              height={48}
              style={{ filter: "brightness(0)" }}
            />
          </div>
          <div
            className={styles.statInfo}
            style={{ textAlign: isRTL ? "right" : "left" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <span className={styles.statValue}>
              {analytics
                ? `${formatNumber(analytics.currentOrders)} ${t("stats.orders")}`
                : "..."}
            </span>
            <span className={styles.statLabel}>{t("stats.activeOrders")}</span>
          </div>
        </Link>
        {/* Card 2: Completed Orders -> /orders?status=COMPLETED */}
        <Link
          href="/orders?status=COMPLETED"
          className={styles.statCard}
          style={{
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className={styles.statIconLarge}>
            <Image
              src="/icons/mark.svg"
              alt="Completed Orders"
              width={48}
              height={48}
              style={{ filter: "brightness(0)" }}
            />
          </div>
          <div
            className={styles.statInfo}
            style={{ textAlign: isRTL ? "right" : "left" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <span className={styles.statValue}>
              {analytics
                ? `${formatNumber(analytics.finishedOrders)} ${t("stats.orders")}`
                : "..."}
            </span>
            <span className={styles.statLabel}>
              {t("stats.completedOrders")}
            </span>
          </div>
        </Link>
        {/* Card 3: Net Profit -> /orders (all orders) */}
        <Link
          href="/orders?status=all"
          className={styles.statCard}
          style={{
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className={styles.statIconLarge}>
            <Image
              src="/icons/Vector.svg"
              alt="Profit"
              width={48}
              height={48}
              style={{ filter: "brightness(0)" }}
            />
          </div>
          <div
            className={styles.statInfo}
            style={{ textAlign: isRTL ? "right" : "left" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <span className={styles.statValue}>
              {analytics
                ? `${formatNumber(analytics.netprofit)} ${tCommon("currency")}`
                : "..."}
            </span>
            <span className={styles.statLabel}>{t("stats.netProfit")}</span>
          </div>
        </Link>
      </div>
    </>
  );
};
