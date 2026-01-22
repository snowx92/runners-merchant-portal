"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/contact.module.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ContactPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    // TODO: Send message to support
    console.log("Send message:", message);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setMessage("");
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
                    <h1 className={styles.pageTitle}>تواصل معنا</h1>
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
            عرض الاسئله الشائعه
          </button>

        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messagesArea}>
            {/* Sample message */}
            <div className={styles.messageWrapper}>
              <div className={styles.message}>
                <p className={styles.messageText}>
                  هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد
                  هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو
                  العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها
                  التطبيق.
                </p>
                <span className={styles.messageTime}>9:12 PM</span>
              </div>
            </div>
          </div>

          <div className={styles.inputArea}>
                        <input
              type="text"
              className={styles.messageInput}
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button className={styles.sendButton} onClick={handleSend}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button className={styles.attachButton}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88583 21.3658 3.76 20.24C2.63417 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63417 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0991 2.00803 15.16 2.00803C16.2209 2.00803 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.162 4.94913 19.162 6.01C19.162 7.07087 18.7406 8.08944 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52544 17.996 7.995 17.996C7.46456 17.996 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99402 16.5254 5.99402 15.995C5.99402 15.4646 6.20472 14.9553 6.58 14.58L15.07 6.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

          </div>
        </div>
      </div>

      <MessageDrawer />
      <LoadingOverlay isLoading={isLoading} />
    </main>
  );
}
