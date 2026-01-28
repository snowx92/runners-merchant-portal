"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/privacy.module.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

import { commonService } from "@/lib/api/services/commonService";


export default function PrivacyPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settings");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await commonService.getPolicy();
        if (response && response.data) {
          setContent(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch policy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <button className={styles.backButton} onClick={() => router.back()}>
              {isRTL ? "→" : "←"}
            </button>
            <h1 className={styles.pageTitle}>{t("privacyPage.title")}</h1>
          </div>
        </div>

        <div className={styles.contentCard}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>{t("common.loading")}</div>
          ) : (
            <div
              className={styles.paragraph}
              dangerouslySetInnerHTML={{ __html: content }}
              style={{ padding: '20px', lineHeight: '1.8' }}
            />
          )}
        </div>
      </div>

      <MessageDrawer />
    </main>
  );
}
