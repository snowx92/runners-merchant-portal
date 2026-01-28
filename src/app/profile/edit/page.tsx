"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/profile/editProfile.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { commonService } from "@/lib/api/services/commonService";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function EditProfilePage() {
  const { user, loading: userLoading } = useUserProfile();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('profile.edit');
  const tCommon = useTranslations('common');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.fistName || "");
      setLastName(user.lastName || "");
      setStoreName(user.storeName || "");
      setProfileImage(user.avatar || null);
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 800px) to avoid massive payloads
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with quality 0.8
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setProfileImage(dataUrl);
          setIsLoading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        firstName,
        lastName,
        storeName,
        avatar: profileImage || "",
      };

      await commonService.updateUserProfile(profileData);

      // Navigate back or show success
      router.back();
    } catch (error) {
      console.error("Failed to update profile", error);
      // Ideally show error message
    } finally {
      setIsLoading(false);
    }
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
            <h1 className={styles.pageTitle}>{t('title')}</h1>
          </div>
          <button className={styles.saveButton} onClick={handleSave}>
            {t('submit')}
          </button>
        </div>

        <div className={styles.formCard}>
          {/* Profile Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper} onClick={handleImageClick}>
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={160}
                  height={160}
                  className={styles.profileImage}
                  unoptimized
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 10v20M10 20h20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
              <div className={styles.editIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.667 14 1.333 14.667 2 11.333 11.333 2Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
          </div>

          {/* Form Fields */}
          <div className={styles.formFields}>
            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('firstName')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('lastName')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Store Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('storeName')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('storeName')}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
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
