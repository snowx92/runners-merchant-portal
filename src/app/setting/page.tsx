"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import styles from "@/styles/setting/setting.module.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

import { commonService } from "@/lib/api/services/commonService";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";

export default function SettingPage() {
  const router = useRouter();
  const [acceptOrdersAuto, setAcceptOrdersAuto] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>الاعدادات</h1>
        </div>

        {/* General Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>اعدادات عامة</h2>
          <div className={styles.card}>
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>قبول الطلبات تلقائيا</span>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={acceptOrdersAuto}
                  onChange={(e) => setAcceptOrdersAuto(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>الوضع الليلي</span>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={nightMode}
                  onChange={(e) => setNightMode(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>حسابك</h2>
          <div className={styles.card}>
            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/change-password")}
            >
              <span>تعديل كلمة المرور</span>
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
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/change-contact")}
            >
              <span>تعديل معلومات التواصل</span>
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
            </button>
          </div>
        </div>

        {/* About App */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>عن التطبيق</h2>
          <div className={styles.card}>
            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/contact")}
            >
              <span>تواصل معنا</span>
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
            </button>

            <button className={styles.menuItem}>
              <span>عن التطبيق</span>
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
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/faq")}
            >
              <span>اسئلة شائعة</span>
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
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/privacy")}
            >
              <span>سياسة الخصوصية</span>
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
            </button>

            <button
              className={styles.menuItem}
              onClick={() => router.push("/setting/terms")}
            >
              <span>الشروط والاحكام</span>
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
          حذف الحساب
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
            <h2 className={styles.modalTitle}>تحذير</h2>
            <p className={styles.modalMessage}>
              هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك بشكل نهائي ولن تتمكن من استرجاعها.
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                إلغاء
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "جاري الحذف..." : "حذف الحساب"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageDrawer />
    </main>
  );
}
