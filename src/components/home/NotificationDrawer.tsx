import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "@/lib/contexts/LocaleContext";
import styles from "@/styles/home/notifications.module.css";
import { commonService } from "@/lib/api/services/commonService";
import { Notification } from "@/lib/api/types/common.types";
import { useAuth } from "@/lib/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

// Notification icon component
const NotificationIcon = ({ iconType }: { iconType: string }) => {
  const getIcon = () => {
    switch (iconType) {
      case "info":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "success":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "warning":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "error":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return <div className={styles.notificationIconWrapper}>{getIcon()}</div>;
};

export const NotificationDrawer = () => {
  const router = useRouter();
  const t = useTranslations('notifications');
  const { locale } = useLocale();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) return;
      
      try {
        const response = await commonService.getUnreadNotificationCount();
        if (response && typeof response.data === 'number') {
          setUnreadCount(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch unread notification count:", error);
      }
      
      await fetchNotifications(1, false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchNotifications = async (page: number = 1, append: boolean = false) => {
    if (!isLoggedIn) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await commonService.getNotifications(page, 20);
      if (response && response.data && response.data.items) {
        if (append) {
          setNotifications(prev => [...prev, ...response.data.items]);
        } else {
          setNotifications(response.data.items);
        }
        setHasMore(!response.data.isLastPage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleToggleDrawer = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      fetchNotifications(1, false);
    }
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await commonService.markNotificationRead(notification.id);
        
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.uid) {
            try {
              const db = getFirebaseDb();
              const notificationDocRef = doc(db, "users", user.uid, "notifications", notification.id);
              await updateDoc(notificationDocRef, { isRead: true });
            } catch (firestoreError) {
              console.error("Failed to update Firestore:", firestoreError);
            }
          }
        }
        
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await commonService.markAllNotificationsRead();
      
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.uid) {
          try {
            const db = getFirebaseDb();
            const unreadNotifications = notifications.filter(n => !n.isRead);
            for (const notification of unreadNotifications) {
              const notificationDocRef = doc(db, "users", user.uid, "notifications", notification.id);
              await updateDoc(notificationDocRef, { isRead: true });
            }
          } catch (firestoreError) {
            console.error("Failed to update Firestore:", firestoreError);
          }
        }
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification);

    if (notification.payload && notification.payload.type) {
      const { type, relatedId } = notification.payload;

      if (type === "order" && relatedId) {
        router.push(`/orders/${relatedId}`);
        handleCloseDrawer();
      } else if (type === "transaction" && relatedId) {
        router.push(`/transaction?ref=${relatedId}`);
        handleCloseDrawer();
      }
    }
  };

  const formatDate = (date: { _seconds: number; _nanoseconds: number }) => {
    try {
      const timestamp = new Date(date._seconds * 1000);
      const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
      return {
        date: timestamp.toLocaleDateString(dateLocale),
        time: timestamp.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: '', time: '' };
    }
  };

  return (
    <>
      <div className={styles.notificationButton} onClick={handleToggleDrawer}>
        <Image src="/icons/Notification.svg" alt="Notifications" width={24} height={24} />
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={handleCloseDrawer}></div>
      )}

      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>{t('title')}</h2>
            {unreadCount > 0 && (
              <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className={styles.notificationsList}>
            {isLoading && notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>{t('loading')}</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>{t('noNotifications')}</div>
            ) : (
              <div className={styles.notificationsContainer}>
                {notifications.map((notification) => {
                  const { date, time } = formatDate(notification.date);
                  const hasNavigationPayload = notification.payload && 
                    (notification.payload.type === "order" || notification.payload.type === "transaction");
                  return (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: hasNavigationPayload ? 'pointer' : 'default' }}
                    >
                      <div className={styles.notificationRight}>
                        <div className={`${styles.iconCircle} ${!notification.isRead ? styles.iconCircleUnread : ""}`}>
                          <NotificationIcon iconType={notification.iconType} />
                        </div>
                        {!notification.isRead && (
                          <div className={styles.unreadDot}></div>
                        )}
                      </div>

                      <div className={styles.notificationCenter}>
                        <h3 className={styles.notificationTitle}>
                          {notification.title}
                        </h3>
                        <p className={styles.notificationDescription}>
                          {notification.body}
                        </p>
                      </div>

                      <div className={styles.notificationLeft}>
                        <div className={styles.notificationDate}>
                          <span className={styles.date}>{date}</span>
                          <span className={styles.time}>{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      className={styles.loadMoreButton}
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? t('loading') : t('loadMore')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
