"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Navbar } from "@/components/home/Navbar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { StatsRow } from "@/components/home/StatsRow";
import { RecentOrders } from "@/components/home/RecentOrders";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/home/home.module.css";
import { Cairo } from "next/font/google";
import { homeService, bannerService } from "@/lib/api/services/homeService";
import type { HomeAnalytics, Banner, Order } from "@/lib/api/types/home.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const [analytics, setAnalytics] = useState<HomeAnalytics | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Immediately redirect if not authenticated once loading is done
    if (!loading && !isAuthenticated) {
      window.location.href = "/auth/login";
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    // Fetch home data when authenticated
    const fetchHomeData = async () => {
      if (!isAuthenticated) return;

      try {
        setDataLoading(true);
        setError(null);

        // Fetch all data in parallel with individual error handling
        const [analyticsRes, bannersRes, ordersRes] = await Promise.allSettled([
          homeService.getAnalytics(),
          bannerService.getBanners(),
          homeService.getOrders(1, 3), // Only fetch 3 recent orders
        ]);

        console.log("📊 Analytics Response:", analyticsRes);
        console.log("🖼️ Banners Response:", bannersRes);
        console.log("📦 Orders Response:", ordersRes);

        // Handle analytics response
        // ApiService returns just the data, not wrapped in { status, message, data }
        if (analyticsRes.status === "fulfilled" && analyticsRes.value) {
          console.log("✅ Setting analytics data:", analyticsRes.value);
          setAnalytics(analyticsRes.value);
        } else if (analyticsRes.status === "rejected") {
          console.error("❌ Analytics fetch failed:", analyticsRes.reason);
        }

        // Handle banners response
        // CommonApiService returns full response with { status, message, data }
        if (bannersRes.status === "fulfilled" && bannersRes.value && bannersRes.value.status === 200 && bannersRes.value.data) {
          console.log("✅ Setting banners data:", bannersRes.value.data);
          setBanners(bannersRes.value.data);
        } else if (bannersRes.status === "rejected") {
          console.error("❌ Banners fetch failed:", bannersRes.reason);
        }

        // Handle orders response
        // ApiService returns just the data (OrdersResponse with items array)
        if (ordersRes.status === "fulfilled" && ordersRes.value) {
          console.log("✅ Setting orders data:", ordersRes.value.items);
          setOrders(ordersRes.value.items);
        } else if (ordersRes.status === "rejected") {
          console.error("❌ Orders fetch failed:", ordersRes.reason);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(err instanceof Error ? err.message : tCommon('failedToLoad'));
      } finally {
        setDataLoading(false);
      }
    };

    fetchHomeData();
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontSize: "1.2rem",
        color: "#666"
      }}>
        {tCommon('loading')}
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }


  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.pageTitle} style={{ textAlign: isRTL ? 'right' : 'left' }}>{t('title')}</h1>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {dataLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            {tCommon('loadingData')}
          </div>
        ) : (
          <>
            <HeroBanner banners={banners} />
            <StatsRow analytics={analytics} />
            <RecentOrders orders={orders} />
          </>
        )}
      </div>

      <MessageDrawer />
      <LoadingOverlay isLoading={dataLoading && orders.length === 0} />
    </main>
  );
}
