import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { commonService } from "@/lib/api/services/commonService";

export function useChatCount() {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setTimeout(() => {
        setUnreadCount(0);
        setLoading(false);
      }, 0);
      return;
    }

    const fetchChatCount = async () => {
      try {
        const response = await commonService.getUnreadChatCount();
        if (response && typeof response.data === 'number') {
          setUnreadCount(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch unread chat count:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch chat count");
      } finally {
        setLoading(false);
      }
    };

    fetchChatCount();
  }, [isLoggedIn]);

  return { unreadCount, loading, error };
}
