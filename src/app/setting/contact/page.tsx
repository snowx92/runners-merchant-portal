"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import styles from "@/styles/setting/contact.module.css";
import { Cairo } from "next/font/google";
import Script from "next/script";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ContactPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settings");

  // Initialize Freshchat when component mounts
  useEffect(() => {
    // Wait for Freshchat to load and initialize it
    const initFreshchat = () => {
      console.log('Initializing Freshchat...', (window as any).fcWidget);

      if ((window as any).fcWidget) {
        // Initialize with custom config to hide the launcher
        (window as any).fcWidget.init({
          token: "40297092",
          host: "https://uae.freshchat.com",
          config: {
            headerProperty: {
              hideChatButton: true, // Hide the floating launcher button
            },
          },
        });

        console.log('Freshchat initialized, opening widget...');

        // Auto-open the chat widget
        (window as any).fcWidget.open();

        // Move the Freshchat widget into our container
        const moveWidget = () => {
          const chatContainer = document.getElementById('freshchat-container');

          // Log all iframes on the page for debugging
          const allIframes = document.querySelectorAll('iframe');
          console.log('All iframes on page:', allIframes);

          // Try to find the Freshchat widget container (usually a div with specific id)
          const freshchatWidget =
            document.querySelector('div[id*="fc"]') ||
            document.querySelector('div[class*="fc"]') ||
            document.querySelector('div[class*="freshchat"]');

          // Try multiple selectors to find the Freshchat iframe
          const freshchatFrame =
            document.querySelector('iframe#fc_frame') ||
            document.querySelector('iframe[id*="freshchat"]') ||
            document.querySelector('iframe[name*="fc"]') ||
            document.querySelector('iframe[title*="Freshchat"]') ||
            document.querySelector('iframe[src*="freshchat"]');

          console.log('Freshchat widget found:', freshchatWidget);
          console.log('Freshchat iframe found:', freshchatFrame);
          console.log('Chat container found:', chatContainer);

          if (chatContainer) {
            // Remove the placeholder
            const freshchatInfo = document.querySelector(`.${styles.freshchatInfo}`);
            if (freshchatInfo) {
              freshchatInfo.remove();
            }

            // Try to move the widget
            if (freshchatWidget) {
              // Style and move the entire widget container
              (freshchatWidget as HTMLElement).style.position = 'relative';
              (freshchatWidget as HTMLElement).style.width = '100%';
              (freshchatWidget as HTMLElement).style.height = '100%';
              (freshchatWidget as HTMLElement).style.inset = 'auto';
              (freshchatWidget as HTMLElement).style.transform = 'none';
              (freshchatWidget as HTMLElement).style.zIndex = 'auto';

              chatContainer.appendChild(freshchatWidget);
              console.log('Moved entire widget container');
            } else if (freshchatFrame) {
              // Fallback: move just the iframe
              const frameParent = (freshchatFrame as HTMLElement).parentElement;

              if (frameParent) {
                (frameParent as HTMLElement).style.position = 'relative';
                (frameParent as HTMLElement).style.width = '100%';
                (frameParent as HTMLElement).style.height = '100%';
                (frameParent as HTMLElement).style.inset = 'auto';
                (frameParent as HTMLElement).style.transform = 'none';
                (frameParent as HTMLElement).style.zIndex = 'auto';
                chatContainer.appendChild(frameParent);
              } else {
                (freshchatFrame as HTMLElement).style.position = 'relative';
                (freshchatFrame as HTMLElement).style.width = '100%';
                (freshchatFrame as HTMLElement).style.height = '100%';
                (freshchatFrame as HTMLElement).style.border = 'none';
                (freshchatFrame as HTMLElement).style.borderRadius = '12px';
                chatContainer.appendChild(freshchatFrame);
              }
              console.log('Moved iframe');
            } else {
              console.error('Could not find Freshchat widget or iframe');
            }
          }
        };

        // Try multiple times as Freshchat may take time to fully render
        setTimeout(moveWidget, 2000);
        setTimeout(moveWidget, 3000);
        setTimeout(moveWidget, 4000);
      }
    };

    // Check if script is already loaded
    if ((window as any).fcWidget) {
      initFreshchat();
    } else {
      // Wait for script to load
      window.addEventListener('load', initFreshchat);
      return () => window.removeEventListener('load', initFreshchat);
    }
  }, []);

  return (
    <>
      {/* Load Freshchat script */}
      <Script
        src="//uae.fw-cdn.com/40297092/184501.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Freshchat script loaded')}
      />

      <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>{t("contactPage.title")}</h1>
            <button
              className={styles.previousQuestionsButton}
              onClick={() => router.push("/setting/faq")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 5L7.5 10L12.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("contactPage.previousQuestions")}
            </button>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.messagesArea} id="freshchat-container">
              <div className={styles.freshchatInfo}>
                <h2 className={styles.freshchatTitle}>
                  {isRTL ? "دعم العملاء" : "Customer Support"}
                </h2>
                <p className={styles.freshchatDescription}>
                  {isRTL
                    ? "جاري تحميل الدردشة المباشرة..."
                    : "Loading live chat..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <MessageDrawer />
      </main>
    </>
  );
}
