"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("settings");
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
      setPhoneError(t("changeContactPage.errors.startWith01"));
      return false;
    }

    if (cleanPhone.length !== 11) {
      setPhoneError(t("changeContactPage.errors.length11Digits"));
      return false;
    }

    if (!/^\d+$/.test(cleanPhone)) {
      setPhoneError(t("changeContactPage.errors.numbersOnly"));
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
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <button className={styles.backButton} onClick={() => router.back()}>
              {isRTL ? "→" : "←"}
            </button>
            <h1 className={styles.pageTitle}>{t("changeContactPage.title")}</h1>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            {t("changeContactPage.saveButton")}
          </button>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formRow}>
            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("changeContactPage.phone")}</label>
              <input
                type="tel"
                className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
                placeholder={t("changeContactPage.phonePlaceholder")}
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
              />
              {phoneError && <p className={styles.errorText}>{phoneError}</p>}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("changeContactPage.email")}</label>
              <input
                type="email"
                className={styles.input}
                placeholder={t("changeContactPage.emailPlaceholder")}
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
