"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { AddAddressModal } from "@/components/profile/AddAddressModal";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/profile/profile.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { commonService } from "@/lib/api/services/commonService";
import { locationService } from "@/lib/api/services/locationService";
import { Review } from "@/lib/api/types/common.types";
import type { LocationResponse } from "@/lib/api/types/location.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ProfilePage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const { user, loading } = useUserProfile();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [locations, setLocations] = useState<LocationResponse["data"][]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);

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

    const fetchLocations = async () => {
      setIsLocationsLoading(true);
      try {
        const response = await locationService.getLocations();
        console.log("Locations API Response:", response);
        if (response && Array.isArray(response)) {
          console.log("Setting locations:", response);
          setLocations(response);
        } else {
          console.log("No data in response or invalid format");
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setIsLocationsLoading(false);
      }
    };

    if (user) {
      fetchReviews();
      fetchLocations();
    }
  }, [user]);

  useEffect(() => {
    console.log("Locations state updated:", locations, "Length:", locations.length);
  }, [locations]);



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={styles.star}>
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };

  const refetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      if (response && Array.isArray(response)) {
        setLocations(response);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(t('deleteAddressConfirm'))) return;
    try {
      await locationService.deleteLocation(id);
      await refetchLocations();
    } catch (error) {
      console.error("Failed to delete address", error);
      alert(t('deleteAddressFailed'));
    }
  };

  const handleEditAddress = (id: string) => {
    setEditingAddressId(id);
    setIsAddAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData: {
    title: string;
    street: string;
    cityId: string;
    stateId: string;
    phoneNumber: string;
    latitude: number;
    longitude: number;
    defaultAddress: boolean;
    buildingNumber: string;
    floorNumber: string;
    apartmentNumber: string;
    notes: string;
  }) => {
    try {
      if (editingAddressId) {
        await locationService.updateLocation(editingAddressId, addressData);
      } else {
        await locationService.createLocation(addressData);
      }
      await refetchLocations();
      setIsAddAddressModalOpen(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Failed to save address", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("NOT_FOUND") || errorMessage.includes("No document")) {
        alert(t('addressOldError'));
      } else {
        alert(t('saveAddressFailed') + ": " + errorMessage);
      }
    }
  };

  const getInitialAddressData = () => {
    if (!editingAddressId || !locations) return null;
    const addr = locations.find(a => a.id === editingAddressId);
    if (!addr) return null;
    return {
      title: addr.title,
      street: addr.street,
      city: addr.city || "",
      cityId: addr.cityId || "",
      state: addr.state || "",
      stateId: addr.stateId || "",
      phoneNumber: addr.phoneNumber,
      latitude: addr.latitude,
      longitude: addr.longitude,
      defaultAddress: addr.defaultAddress || false,
      buildingNumber: addr.buildingNumber,
      floorNumber: addr.floorNumber,
      apartmentNumber: addr.apartmentNumber,
      notes: addr.notes
    };
  };

  if (loading) return <div className={styles.mainContainer}><Navbar /><div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>{tCommon('loading')}</div></div>;

  const displayName = user?.fullName || user?.storeName || (user?.fistName ? `${user.fistName} ${user.lastName}` : tCommon('user'));
  const displayAvatar = user?.avatar || "/icons/User.svg";

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        {/* Page Title and Buttons */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>{t('title')}</h1>
          <div className={styles.headerButtons}>
            <button
              className={styles.reviewsButton}
              onClick={() => router.push("/profile/edit")}
            >
              {t('editAccount')}
            </button>
            {!user?.verified && (
              <button
                className={styles.verifyButton}
                onClick={() => router.push("/profile/verify")}
              >
                {t('verifyAccount')}
              </button>
            )}
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
                <h2 className={styles.userName}>
                  {displayName}
                  {user?.verified && (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: '8px', verticalAlign: 'middle' }}
                    >
                      <circle cx="12" cy="12" r="10" fill="#10B981" />
                      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </h2>
                <p className={styles.userId}>{user?.id || ''}</p>
              </div>
            </div>

          </div>

          {/* Addresses Section */}
          <div className={styles.addressesSection}>
            <div className={styles.addressesHeader}>
              <h3 className={styles.addressesTitle}>{t('addresses')}</h3>
              <button
                className={styles.addAddressButton}
                onClick={() => {
                  setEditingAddressId(null);
                  setIsAddAddressModalOpen(true);
                }}
              >
                {t('addAddress')}
              </button>
            </div>

            <div className={styles.addressesList}>
              {isLocationsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t('loadingAddresses')}</div>
              ) : locations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t('noAddresses')}</div>
              ) : (
                locations.map((address) => (
                  <div key={address.id} className={styles.addressItem}>
                    <div className={styles.addressContent}>
                      <div className={styles.addressInfo}>
                        <p className={styles.addressLabel}>
                          {address.title}
                          {address.defaultAddress && <span style={{ marginRight: '8px', color: '#10B981', fontSize: '0.85rem' }}>{"● " + tCommon('default')}</span>}
                        </p>
                        <p className={styles.addressText}>
                          {address.street}
                          {address.city && `, ${address.city}`}
                          {address.state && `, ${address.state}`}
                          {address.buildingNumber && ` - ${t('building')} ${address.buildingNumber}`}
                          {address.floorNumber && ` - ${t('floor')} ${address.floorNumber}`}
                          {address.apartmentNumber && ` - ${t('apartment')} ${address.apartmentNumber}`}
                        </p>
                        <p className={styles.addressText}>{address.phoneNumber}</p>
                        {address.notes && <p className={styles.addressText} style={{ fontSize: '0.85rem', color: '#999' }}>{address.notes}</p>}
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('reviews')}</h3>

          {isReviewsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>{t('loadingReviews')}</div>
          ) : (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => {
                const reviewerName = review.reviewerName || (review.user ? `${review.user.firstName} ${review.user.lastName}` : tCommon('user'));
                const reviewerAvatar = review.reviewerAvatar || review.user?.avatar || "/icons/User.svg";
                const reviewDate = review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : "");

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
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{t('noReviews')}</div>
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
      <LoadingOverlay isLoading={loading || isReviewsLoading || isLocationsLoading} />
    </main>
  );
}

