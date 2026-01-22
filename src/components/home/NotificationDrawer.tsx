import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/home/notifications.module.css";
import { commonService } from "@/lib/api/services/commonService";
import { Notification } from "@/lib/api/types/common.types";
import { useAuth } from "@/lib/hooks/useAuth";

// Notification icon component
const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  const getIcon = () => {
    switch (type) {
      case "new_offer":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "credit_added":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "order_started":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "offer_accepted":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "new_review":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
          </svg>
        );
      case "new_delivery":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 16h6v-3h-3l-3-3V7h-5v9h5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 16V7a2 2 0 0 1 2-2h6v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        // Default icon if type is unknown
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  return <div className={styles.notificationIconWrapper}>{getIcon()}</div>;
};

export const NotificationDrawer = () => {
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    try {
      const response = await commonService.getNotifications();
      if (response.status === 200 && Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleDrawer = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      fetchNotifications();
    }
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await commonService.markNotificationRead(notification.id);
        // Optimistically update UI
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  }

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('ar-EG'),
        time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: '', time: '' };
    }
  }


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


          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {isLoading && notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>لا توجد إشعارات</div>
            ) : (
              notifications.map((notification) => {
                const { date, time } = formatDate(notification.createdAt || notification.date);
                return (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ""
                      }`}
                    onClick={() => handleMarkAsRead(notification)}
                    style={{ cursor: !notification.isRead ? 'pointer' : 'default' }}
                  >
                    <div className={styles.notificationRight}>
                      <div className={`${styles.iconCircle} ${!notification.isRead ? styles.iconCircleUnread : ""}`}>
                        <NotificationIcon type={notification.type} />
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
                        {notification.description}
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
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
