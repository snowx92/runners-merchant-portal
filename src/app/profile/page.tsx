"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { AddAddressModal } from "@/components/profile/AddAddressModal";
import styles from "@/styles/profile/profile.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { commonService } from "@/lib/api/services/commonService";
import { Review, Address } from "@/lib/api/types/common.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ProfilePage() {
  const router = useRouter();
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const { user, loading, refetch } = useUserProfile();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (user?.id) {
        setIsReviewsLoading(true);
        try {
          const response = await commonService.getReviews(user.id);
          if (response && Array.isArray(response.data)) {
            setReviews(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch reviews:", error);
        } finally {
          setIsReviewsLoading(false);
        }
      }
    };

    if (user) {
      fetchReviews();
    }
  }, [user]);



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={styles.star}>
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;
    try {
      await commonService.deleteAddress(id);
      refetch();
    } catch (error) {
      console.error("Failed to delete address", error);
      alert("فشل حذف العنوان");
    }
  };

  const handleEditAddress = (id: string) => {
    setEditingAddressId(id);
    setIsAddAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData: {
    location: string;
    phone: string;
    governorate: string;
    city: string;
    detailedAddress: string;
  }) => {
    try {
      if (editingAddressId) {
        await commonService.updateAddress(editingAddressId, {
          ...addressData,
          governorateId: addressData.governorate,
          cityId: addressData.city
        });
      } else {
        await commonService.addAddress({
          ...addressData,
          governorateId: addressData.governorate,
          cityId: addressData.city
        });
      }
      refetch();
      setIsAddAddressModalOpen(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Failed to save address", error);
      alert("فشل حفظ العنوان");
    }
  };

  const getInitialAddressData = () => {
    if (!editingAddressId || !user?.locations) return null;
    const addr = user.locations.find(a => a.id === editingAddressId);
    if (!addr) return null;
    return {
      location: addr.location,
      phone: addr.phone,
      governorate: addr.governorateId,
      city: addr.cityId,
      detailedAddress: addr.detailedAddress
    };
  };

  if (loading) return <div className={styles.mainContainer}><Navbar /><div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>جاري التحميل...</div></div>;

  const displayName = user?.fullName || user?.storeName || (user?.fistName ? `${user.fistName} ${user.lastName}` : "المستخدم");
  const displayAvatar = user?.avatar || "/icons/User.svg";

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        {/* Page Title and Buttons */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>الملف الشخصي</h1>
          <div className={styles.headerButtons}>
            <button
              className={styles.reviewsButton}
              onClick={() => router.push("/profile/edit")}
            >
              تعديل الحساب
            </button>
            <button
              className={styles.verifyButton}
              onClick={() => router.push("/profile/verify")}
            >
              توثيق الحساب
            </button>
            {user?.verified && <span style={{ color: 'green', marginRight: '10px' }}>موثق</span>}
          </div>
        </div>

        {/* Profile and Addresses Card */}
        <div className={styles.profileCard}>
          {/* User Info */}
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <div className={styles.profileImageWrapper}>
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  width={80}
                  height={80}
                  className={styles.profileImage}
                  unoptimized
                />
              </div>
              <div className={styles.userDetails}>
                <h2 className={styles.userName}>{displayName}</h2>
                <p className={styles.userId}>{user?.id || ''}</p>
              </div>
            </div>

          </div>

          {/* Addresses Section */}
          <div className={styles.addressesSection}>
            <div className={styles.addressesHeader}>
              <h3 className={styles.addressesTitle}>عناوين الاستلام</h3>
              <button
                className={styles.addAddressButton}
                onClick={() => {
                  setEditingAddressId(null);
                  setIsAddAddressModalOpen(true);
                }}
              >
                إضافة عنوان
              </button>
            </div>

            <div className={styles.addressesList}>
              {user?.locations?.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>لا توجد عناوين محفوظة</div>}
              {user?.locations?.map((address) => (
                <div key={address.id} className={styles.addressItem}>
                  <div className={styles.addressContent}>
                    <div className={styles.addressInfo}>
                      <p className={styles.addressLabel}>{address.location}</p>
                      <p className={styles.addressText}>{address.detailedAddress}</p>
                    </div>
                    <div className={styles.addressActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleEditAddress(address.id)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.166 2.5a2.357 2.357 0 0 1 3.333 3.333l-9.166 9.167-4.167.834.834-4.167L14.166 2.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className={styles.iconButtonDelete}
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 5h15M6.667 5V3.333a1.667 1.667 0 0 1 1.666-1.666h3.334a1.667 1.667 0 0 1 1.666 1.666V5m2.5 0v11.667a1.667 1.667 0 0 1-1.666 1.666H5.833a1.667 1.667 0 0 1-1.666-1.666V5h11.666Z"
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
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>تقييماتك</h3>

          {isReviewsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>جاري تحميل التقييمات...</div>
          ) : (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => {
                const reviewerName = review.reviewerName || (review.user ? `${review.user.firstName} ${review.user.lastName}` : "مستخدم");
                const reviewerAvatar = review.reviewerAvatar || review.user?.avatar || "/icons/User.svg";
                const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG') : "");

                return (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerAvatar}>
                          <Image
                            src={reviewerAvatar}
                            alt={reviewerName}
                            width={48}
                            height={48}
                            unoptimized
                          />
                        </div>
                        <div className={styles.reviewerDetails}>
                          <h3 className={styles.reviewerName}>
                            {reviewerName}
                          </h3>
                          <span className={styles.reviewTime}>{reviewDate}</span>
                        </div>
                      </div>
                      <div className={styles.reviewRating}>
                        {renderStars(review.rating)}
                      </div>

                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                );
              })}
              {!isReviewsLoading && reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>لا توجد تقييمات</div>
              )}
            </div>
          )}
        </div>
      </div>

      <MessageDrawer />
      <AddAddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => {
          setIsAddAddressModalOpen(false);
          setEditingAddressId(null);
        }}
        onSave={handleSaveAddress}
        initialData={getInitialAddressData()}
      />
    </main>
  );
}
