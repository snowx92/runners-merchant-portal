import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/styles/home/notifications.module.css";
import { commonService } from "@/lib/api/services/commonService";
import { Notification } from "@/lib/api/types/common.types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotificationCount } from "@/lib/hooks/useNotificationCount";
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
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Use real-time notification count from Firestore
  const { unreadCount: realTimeUnreadCount, loading: realTimeLoading } = useNotificationCount();
  
  // Local state for unread count (synced with real-time updates)
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync real-time count to local state
  // Priority: use API count on initial load, then real-time updates
  useEffect(() => {
    // If we have a real-time count and we're still loading API, use real-time
    if (realTimeUnreadCount >= 0 && !realTimeLoading) {
      setUnreadCount(realTimeUnreadCount);
    }
  }, [realTimeUnreadCount, realTimeLoading]);

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
        // Calculate unread count from API response: totalItems - docsReaded
        // This is the authoritative count from the backend
        const apiUnread = Math.max(0, response.data.totalItems - response.data.docsReaded);
        setUnreadCount(apiUnread);
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

  useEffect(() => {
    fetchNotifications(1, false);
    // Polling removed - using real-time Firestore listener via useNotificationCount hook
    // const interval = setInterval(() => fetchNotifications(1, false), 60000);
    // return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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
        // Call API to mark as read
        await commonService.markNotificationRead(notification.id);
        
        // Also update Firestore to sync with the real-time listener
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
              // Continue even if Firestore update fails - the API call succeeded
            }
          }
        }
        
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        // Decrement count (Firestore listener will update it, but we update locally too)
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Call API to mark all as read
      await commonService.markAllNotificationsRead();
      
      // Also update Firestore to sync with the real-time listener
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.uid) {
          try {
            const db = getFirebaseDb();
            // Get all unread notifications from local state and update them in Firestore
            const unreadNotifications = notifications.filter(n => !n.isRead);
            for (const notification of unreadNotifications) {
              const notificationDocRef = doc(db, "users", user.uid, "notifications", notification.id);
              await updateDoc(notificationDocRef, { isRead: true });
            }
          } catch (firestoreError) {
            console.error("Failed to update Firestore:", firestoreError);
            // Continue even if Firestore update fails - the API call succeeded
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
    // Mark as read
    handleMarkAsRead(notification);

    // Navigate based on notification type
    if (notification.payload && notification.payload.type) {
      const { type, relatedId } = notification.payload;

      if (type === "order" && relatedId) {
        // Navigate to order details
        router.push(`/orders/${relatedId}`);
        handleCloseDrawer();
      } else if (type === "transaction" && relatedId) {
        // Navigate to transaction page with ref parameter
        router.push(`/transaction?ref=${relatedId}`);
        handleCloseDrawer();
      }
      // For other types or empty payload, do nothing
    }
  };

  const formatDate = (date: { _seconds: number; _nanoseconds: number }) => {
    try {
      const timestamp = new Date(date._seconds * 1000);
      return {
        date: timestamp.toLocaleDateString('ar-EG'),
        time: timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: '', time: '' };
    }
  };


  return (
    <>
      {/* Notification Icon Button */}
      <div className={styles.notificationButton} onClick={handleToggleDrawer}>
        <Image src="/icons/Notification.svg" alt="Notifications" width={24} height={24} />
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>{unreadCount}</span>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleCloseDrawer}></div>
      )}

      {/* Notification Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerContent}>
          {/* Header with Mark All as Read */}
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>الإشعارات</h2>
            {unreadCount > 0 && (
              <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {isLoading && notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>لا توجد إشعارات</div>
            ) : (
              <>
                {notifications.map((notification) => {
                  const { date, time } = formatDate(notification.date);
                  // Check if notification has navigation payload
                  const hasNavigationPayload = notification.payload && 
                    (notification.payload.type === "order" || notification.payload.type === "transaction");
                  return (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ""
                        }`}
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
                  )
                })}

                {/* Load More Button */}
                {hasMore && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      className={styles.loadMoreButton}
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
