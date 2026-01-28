"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/setting.module.css";
import { Cairo } from "next/font/google";
import { commonService } from "@/lib/api/services";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";
import { useToast } from "@/lib/contexts/ToastContext";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function SettingPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { showToast } = useToast();
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const [acceptOrdersAuto, setAcceptOrdersAuto] = useState(true);
  const [isSupplier, setIsSupplier] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await commonService.getUserProfile();
      if (response && response.data) {
        // Check if user is a supplier
        const userType = response.data.type?.toUpperCase();
        setIsSupplier(userType === "SUPPLIER" || userType === "MERCHANT");
        
        // Set initial autoAccept value (only for suppliers)
        if (userType === "SUPPLIER" || userType === "MERCHANT") {
          setAcceptOrdersAuto(response.data.autoAccept || false);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAcceptToggle = async (enabled: boolean) => {
    setAcceptOrdersAuto(enabled);
    setIsUpdating(true);

    try {
      await commonService.updateUserProfile({ autoAccept: enabled });
      showToast(t('settingUpdated'), "success");
    } catch (error) {
      console.error("Error updating autoAccept:", error);
      // Revert the toggle on error
      setAcceptOrdersAuto(!enabled);
      showToast(t('settingUpdateFailed'), "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await commonService.deleteAccount();

      // Logout
      const auth = getFirebaseAuth();
      await signOut(auth);
      SessionManager.getInstance().clearAll();

      router.push("/auth/login");
    } catch (error) {
      console.error("Delete account error:", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
      // Optional: show error toast
    }
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>{t('title')}</h1>
        </div>

        {/* General Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('general')}</h2>
          <div className={styles.card}>
            {/* Auto Accept Orders - Only for suppliers */}
            {isSupplier && (
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>{t('autoAcceptOrders')}</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={acceptOrdersAuto}
                    onChange={(e) => handleAutoAcceptToggle(e.target.checked)}
                    disabled={loading || isUpdating}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('account')}</h2>
          <div className={styles.card}>
            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/change-password")}
            >
              <span>{t('changePassword')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/change-contact")}
            >
              <span>{t('changeContact')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/api-keys")}
            >
              <span>{t('apiKeys')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* About App */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('about')}</h2>
          <div className={styles.card}>
            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/contact")}
            >
              <span>{t('contactUs')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/faq")}
            >
              <span>{t('faq')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/privacy")}
            >
              <span>{t('privacy')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/terms")}
            >
              <span>{t('terms')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <button className={styles.deleteButton} onClick={() => setShowDeleteModal(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 5H4.16667H17.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.66699 5.00016V3.3335C6.66699 2.89147 6.84259 2.46769 7.15515 2.16513C7.46771 1.86257 7.8915 1.68697 8.33353 1.68697H11.667C12.109 1.68697 12.5328 1.86257 12.8454 2.16513C13.1579 2.46769 13.3335 2.89147 13.3335 3.3335V5.00016M15.8337 5.00016V16.6668C15.8337 17.1089 15.6581 17.5327 15.3455 17.8452C15.0329 18.1578 14.6091 18.3335 14.167 18.3335H5.83366C5.39163 18.3335 4.96784 18.1578 4.65528 17.8452C4.34272 17.5327 4.16699 17.1089 4.16699 16.6668V5.00016H15.8337Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t('deleteAccount')}
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#FEE2E2" />
                <path
                  d="M24 16V24M24 32H24.01"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={styles.modalTitle}>{t('deleteAccountWarning')}</h2>
            <p className={styles.modalMessage}>
              {t('deleteAccountMessage')}
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                {tCommon('cancel')}
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? t('deleting') : t('deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageDrawer />
      <LoadingOverlay isLoading={loading || isUpdating} />
    </main>
  );
}
