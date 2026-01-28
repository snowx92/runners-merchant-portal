"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/faq.module.css";
import { Cairo } from "next/font/google";
import { commonService } from "@/lib/api/services/commonService";
import { Faq } from "@/lib/api/types/common.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function FAQPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settings");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await commonService.getFaqs();
        // Assuming response is unwrapped by the service based on other service patterns 
        // OR it returns ApiResponse<Faq[]>. Note that commonService returns ApiResponse<T> explicitly.
        // But `homeService` has check: `if (!response)`. 
        // `CommonService.getFaqs` returns `Promise<ApiResponse<Faq[]>>`.
        // We need to access .data.

        if (response && Array.isArray(response.data)) {
          setFaqs(response.data);
          // Open first item if exists
          if (response.data.length > 0) {
            setOpenItems([response.data[0].id]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>{t("faqPage.title")}</h1>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>{t("common.loading")}</div>
        ) : (
          <div className={styles.faqList}>
            {faqs.map((item) => (
              <div key={item.id} className={styles.faqItem}>
                <button
                  className={`${styles.faqQuestion} ${openItems.includes(item.id) ? styles.faqQuestionOpen : ""
                    }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{item.question}</span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${styles.chevron} ${openItems.includes(item.id) ? styles.chevronOpen : ""
                      }`}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {openItems.includes(item.id) && (
                  <div className={styles.faqAnswer}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <MessageDrawer />
    </main>
  );
}
