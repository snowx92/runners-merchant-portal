import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { commonService } from "@/lib/api/services/commonService";

export function useNotificationCount() {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setTimeout(() => {
        setUnreadCount(0);
        setLoading(false);
      }, 0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const response = await commonService.getUnreadNotificationCount();
        if (response && typeof response.data === 'number') {
          setUnreadCount(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch unread notification count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationCount();
  }, [isLoggedIn]);

  return { unreadCount, loading };
}
