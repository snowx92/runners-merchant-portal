"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/profile/verifyProfile.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { commonService } from "@/lib/api/services/commonService";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function VerifyProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idHolderImage, setIdHolderImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const idImageInputRef = useRef<HTMLInputElement>(null);
  const idHolderImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, profileRes] = await Promise.allSettled([
          commonService.getVerificationStatus(),
          commonService.getUserProfile()
        ]);

        if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
          setVerificationStatus(statusRes.value.data);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const profile = profileRes.value.data;
          setFirstName((prev) => prev || profile.firstName || profile.fistName || "");
          setLastName((prev) => prev || profile.lastName || "");
        }
      } catch (error) {
        console.error("Failed to fetch verification data", error);
      }
    };
    fetchData();
  }, []);

  const handleIdImageClick = () => {
    if (verificationStatus === 'PENDING' || verificationStatus === 'APPROVED') return;
    idImageInputRef.current?.click();
  };

  const handleIdHolderImageClick = () => {
    if (verificationStatus === 'PENDING' || verificationStatus === 'APPROVED') return;
    idHolderImageInputRef.current?.click();
  };

  // Helper to convert image to JPEG base64
  const processImage = (file: File, callback: (base64: string) => void) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        callback(dataUrl);
        setIsLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, setIdImage);
    }
  };

  const handleIdHolderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, setIdHolderImage);
    }
  };

  const handleVerify = async () => {
    if (!firstName || !lastName || !idNumber || !birthDate || !idImage || !idHolderImage) {
      // Basic validation
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    setIsLoading(true);
    const verificationData = {
      firstName,
      lastName,
      nationalNumber: idNumber,
      birthDate, // Assuming input date is already ISO-like YYYY-MM-DD
      nationalCard: idImage,
      personWithCard: idHolderImage,
    };

    try {
      await commonService.submitVerification(verificationData);
      // Refresh status
      const response = await commonService.getVerificationStatus();
      if (response && response.data) {
        setVerificationStatus(response.data);
      }
      alert("تم إرسال طلب التوثيق بنجاح");
      router.back();
    } catch (error) {
      console.error("Verification submission failed:", error);
      alert("فشل في إرسال طلب التوثيق");
    } finally {
      setIsLoading(false);
    }
  };

  // If status is PENDING or APPROVED, disable inputs and show status
  const isReadOnly = verificationStatus === 'PENDING' || verificationStatus === 'APPROVED';

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
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className={styles.pageTitle}>توثيق الحساب</h1>
          </div>
          {/* Show status instead of button if verified or pending? */}
          {!isReadOnly && (
            <button className={styles.verifyButton} onClick={handleVerify}>
              تحقق من البيانات
            </button>
          )}
          {verificationStatus === 'PENDING' && <div style={{ color: 'orange', fontWeight: 'bold' }}>قيد المراجعة</div>}
          {verificationStatus === 'APPROVED' && <div style={{ color: 'green', fontWeight: 'bold' }}>تم التوثيق</div>}
        </div>

        <div className={styles.formCard}>
          {/* Form Fields in Two Columns */}
          <div className={styles.formRow}>
            {/* Right Column */}
            <div className={styles.formColumn}>
              {/* First Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>الاسم الأول</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="الاسم الأول"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {/* ID Number */}
              <div className={styles.formGroup}>
                <label className={styles.label}>رقم البطاقة</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="رقم البطاقة"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Left Column */}
            <div className={styles.formColumn}>
              {/* Last Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>الاسم الأخير</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="الاسم الأخير"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {/* Birth Date */}
              <div className={styles.formGroup}>
                <label className={styles.label}>تاريخ الميلاد</label>
                <div className={styles.dateInputWrapper}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    placeholder="ي ي/ش ش/س س/س س"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <svg
                      className={styles.calendarIcon}
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="14"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 8h14M7 2v3M13 2v3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ID Card Image Upload */}
          <div className={styles.uploadSection}>
            <label className={styles.uploadLabel}>بطاقة الهوية</label>
            <div className={styles.uploadBox} onClick={handleIdImageClick} style={{ cursor: isReadOnly ? 'default' : 'pointer' }}>
              {idImage ? (
                <Image
                  src={idImage}
                  alt="ID Card"
                  width={600}
                  height={200}
                  className={styles.uploadedImage}
                />
              ) : (
                <>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.uploadIcon}
                  >
                    <path
                      d="M24 16v16M16 24h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 8c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <p className={styles.uploadText}>
                    قم بتصوير صورة بطاقة هويتك صورة واضحة من الوجه الأمامي، تأكد من ظهور الاسم ووضوح الصورة
                  </p>
                </>
              )}
            </div>
            <input
              ref={idImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleIdImageChange}
              className={styles.fileInput}
            />
          </div>

          {/* ID Holder Image Upload */}
          <div className={styles.uploadSection}>
            <label className={styles.uploadLabel}>صورة لنفسك حاملاً البطاقة</label>
            <div className={styles.uploadBox} onClick={handleIdHolderImageClick} style={{ cursor: isReadOnly ? 'default' : 'pointer' }}>
              {idHolderImage ? (
                <Image
                  src={idHolderImage}
                  alt="ID Holder"
                  width={600}
                  height={200}
                  className={styles.uploadedImage}
                />
              ) : (
                <>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.uploadIcon}
                  >
                    <path
                      d="M24 16v16M16 24h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 8c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <p className={styles.uploadText}>
                    قم بتصوير نفسك حاملاً بطاقتك الشخصية صورة سيلفي، تأكد من ظهور ملامح وجهك والبطاقة
                  </p>
                </>
              )}
            </div>
            <input
              ref={idHolderImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleIdHolderImageChange}
              className={styles.fileInput}
            />
          </div>
        </div>
      </div>

      <MessageDrawer />
      <LoadingOverlay isLoading={isLoading} />
    </main>
  );
}
