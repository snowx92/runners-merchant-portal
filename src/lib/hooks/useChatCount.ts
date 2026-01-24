import { useEffect, useState, useRef } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe,
  DocumentData 
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { SessionManager } from "@/lib/utils/session";

export function useChatCount() {
  const { isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    
    // Get current user from localStorage using SessionManager
    const sessionManager = SessionManager.getInstance();
    const userData = sessionManager.getUser<{ uid: string }>();
    
    // Fallback to localStorage if needed
    const localUserData = localStorage.getItem("user");
    const user = userData || (localUserData ? JSON.parse(localUserData) : null);
    
    if (!user || !user.uid) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setUnreadCount(0);
        setLoading(false);
      }, 0);
      return;
    }

    const currentUserUid = user.uid;
    console.log("useChatCount - User UID:", currentUserUid);

    // Create query for chats where user is a participant
    const chatsRef = collection(db, "chats");
    const chatsQuery = query(
      chatsRef,
      where("participants", "array-contains", currentUserUid)
    );

    // Set up real-time listener
    unsubscribeRef.current = onSnapshot(
      chatsQuery,
      (snapshot) => {
        console.log("useChatCount - Chats snapshot size:", snapshot.size);
        
        let totalUnread = 0;
        
        // Calculate total unread count across all chats
        for (const doc of snapshot.docs) {
          const data = doc.data() as DocumentData;
          console.log("useChatCount - Chat doc:", doc.id, data);
          
          const unreadCounts = data['unreadCount'] as Record<string, number> | undefined;
          
          if (unreadCounts && unreadCounts[currentUserUid] !== undefined) {
            totalUnread += unreadCounts[currentUserUid];
          }
        }
        
        setUnreadCount(totalUnread);
        setLoading(false);
        console.log("useChatCount - Total unread:", totalUnread);
      },
      (error) => {
        console.error("Error listening to chats:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or when user changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isLoggedIn]);

  return { unreadCount, loading, error };
}

