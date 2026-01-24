import { useEffect, useState, useRef } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe 
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";

export function useNotificationCount() {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setUnreadCount(0);
        setLoading(false);
      }, 0);
      return;
    }

    const db = getFirebaseDb();
    
    // Get current user from localStorage (same pattern as NotificationDrawer)
    const userData = localStorage.getItem("user");
    if (!userData) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setUnreadCount(0);
        setLoading(false);
      }, 0);
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (!user || !user.uid) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setUnreadCount(0);
          setLoading(false);
        }, 0);
        return;
      }

      // Create query for unread notifications
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const unreadQuery = query(
        notificationsRef,
        where("isRead", "==", false)
      );

      // Set up real-time listener
      unsubscribeRef.current = onSnapshot(
        unreadQuery,
        (snapshot) => {
          const count = snapshot.docs.length;
          setUnreadCount(count);
          setLoading(false);
          console.log("Real-time notification count updated:", count);
        },
        (error) => {
          console.error("Error listening to notifications:", error);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error setting up notification listener:", error);
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }

    // Cleanup subscription on unmount or when user changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isLoggedIn]);

  return { unreadCount, loading };
}

