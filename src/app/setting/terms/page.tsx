"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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


export default function TermsPage() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await commonService.getTerms();
        if (response && response.data) {
          setContent(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className={styles.pageTitle}>الشروط والاحكام</h1>
          </div>
        </div>

        <div className={styles.contentCard}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>جاري التحميل...</div>
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
