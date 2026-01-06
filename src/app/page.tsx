import { Navbar } from "@/components/home/Navbar";
import { HeroBanner, PaginationDots } from "@/components/home/HeroBanner";
import { StatsRow } from "@/components/home/StatsRow";
import { RecentOrders } from "@/components/home/RecentOrders";
import styles from "@/styles/home/home.module.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function Home() {
  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.pageTitle} style={{ textAlign: 'right' }}>الرئيسية</h1>

        <HeroBanner />
        <PaginationDots />

        <StatsRow />
        <RecentOrders />
      </div>
    </main>
  );
}
