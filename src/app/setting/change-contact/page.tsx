"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/changePassword.module.css";
import { Cairo } from "next/font/google";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ChangeContactPage() {
  const router = useRouter();
  const { user } = useUserProfile();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(user.phoneNumber || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const validatePhone = (value: string) => {
    // Remove any spaces or dashes
    const cleanPhone = value.replace(/[\s-]/g, "");

    // Check if it's 11 digits and starts with 01
    if (cleanPhone.length === 0) {
      setPhoneError("");
      return true;
    }

    if (!cleanPhone.startsWith("01")) {
      setPhoneError("رقم الهاتف يجب أن يبدأ بـ 01");
      return false;
    }

    if (cleanPhone.length !== 11) {
      setPhoneError("رقم الهاتف يجب أن يكون 11 رقم");
      return false;
    }

    if (!/^\d+$/.test(cleanPhone)) {
      setPhoneError("رقم الهاتف يجب أن يحتوي على أرقام فقط");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  const handleSave = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    setIsLoading(true);
    // TODO: Implement contact update logic
    console.log("Update contact:", {
      phone: phone.replace(/[\s-]/g, ""),
      email,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

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
            <h1 className={styles.pageTitle}>تعديل معلومات التواصل</h1>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            حفظ التعديلات
          </button>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formRow}>
            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>رقم الهاتف</label>
              <input
                type="tel"
                className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
              />
              {phoneError && <p className={styles.errorText}>{phoneError}</p>}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>البريد الإلكتروني</label>
              <input
                type="email"
                className={styles.input}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <MessageDrawer />
      <LoadingOverlay isLoading={isLoading} />
    </main>
  );
}
