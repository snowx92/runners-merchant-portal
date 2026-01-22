"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/changePassword.module.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implement password change logic
    console.log("Change password:", {
      currentPassword,
      newPassword,
      confirmPassword,
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
            <h1 className={styles.pageTitle}>تعديل كلمة المرور</h1>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            حفظ التعديلات
          </button>
        </div>

        <div className={styles.formCard}>
          {/* Current Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور</label>
            <div className={styles.inputWrapper}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                className={styles.input}
                placeholder="ادخل كلمة المرور"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.95 14.95C13.5255 16.0358 11.7909 16.6374 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10C2.49596 8.35557 3.64605 6.8991 5.05 5.71667M8.25 3.53333C8.82363 3.39907 9.41093 3.33195 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C17.9286 10.9463 17.4061 11.8373 16.7833 12.65M11.7667 11.7667C11.5378 12.0123 11.2617 12.2093 10.9552 12.3459C10.6487 12.4826 10.318 12.5563 9.98294 12.5627C9.64788 12.5692 9.31459 12.5082 9.00334 12.3835C8.69209 12.2588 8.40901 12.0729 8.17176 11.8357C7.93452 11.5984 7.74862 11.3153 7.62394 11.0041C7.49926 10.6928 7.43819 10.3595 7.44463 10.0245C7.45107 9.68942 7.52487 9.35869 7.66154 9.05219C7.7982 8.74568 7.99524 8.46963 8.24083 8.24083"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.66667 1.66667L18.3333 18.3333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66667 10C1.66667 10 4.16667 3.33333 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C18.3333 10 15.8333 16.6667 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور الجديدة</label>
            <div className={styles.inputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                className={styles.input}
                placeholder="ادخل كلمة المرور"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.95 14.95C13.5255 16.0358 11.7909 16.6374 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10C2.49596 8.35557 3.64605 6.8991 5.05 5.71667M8.25 3.53333C8.82363 3.39907 9.41093 3.33195 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C17.9286 10.9463 17.4061 11.8373 16.7833 12.65M11.7667 11.7667C11.5378 12.0123 11.2617 12.2093 10.9552 12.3459C10.6487 12.4826 10.318 12.5563 9.98294 12.5627C9.64788 12.5692 9.31459 12.5082 9.00334 12.3835C8.69209 12.2588 8.40901 12.0729 8.17176 11.8357C7.93452 11.5984 7.74862 11.3153 7.62394 11.0041C7.49926 10.6928 7.43819 10.3595 7.44463 10.0245C7.45107 9.68942 7.52487 9.35869 7.66154 9.05219C7.7982 8.74568 7.99524 8.46963 8.24083 8.24083"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.66667 1.66667L18.3333 18.3333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66667 10C1.66667 10 4.16667 3.33333 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C18.3333 10 15.8333 16.6667 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>تأكيد كلمة المرور</label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                placeholder="ادخل كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.95 14.95C13.5255 16.0358 11.7909 16.6374 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10C2.49596 8.35557 3.64605 6.8991 5.05 5.71667M8.25 3.53333C8.82363 3.39907 9.41093 3.33195 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C17.9286 10.9463 17.4061 11.8373 16.7833 12.65M11.7667 11.7667C11.5378 12.0123 11.2617 12.2093 10.9552 12.3459C10.6487 12.4826 10.318 12.5563 9.98294 12.5627C9.64788 12.5692 9.31459 12.5082 9.00334 12.3835C8.69209 12.2588 8.40901 12.0729 8.17176 11.8357C7.93452 11.5984 7.74862 11.3153 7.62394 11.0041C7.49926 10.6928 7.43819 10.3595 7.44463 10.0245C7.45107 9.68942 7.52487 9.35869 7.66154 9.05219C7.7982 8.74568 7.99524 8.46963 8.24083 8.24083"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.66667 1.66667L18.3333 18.3333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66667 10C1.66667 10 4.16667 3.33333 10 3.33333C15.8333 3.33333 18.3333 10 18.3333 10C18.3333 10 15.8333 16.6667 10 16.6667C4.16667 16.6667 1.66667 10 1.66667 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MessageDrawer />
      <LoadingOverlay isLoading={isLoading} />
    </main>
  );
}
