import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Unsubscribe,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  increment,
  DocumentData,
  FieldValue,
  Timestamp
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { ChatMessage, ChatLocation } from "@/lib/api/types/chat.types";

class ChatService {
  private db = getFirebaseDb();

  /**
   * Get or create a chat room between two participants
   */
  async getOrCreateChatRoom(currentUserId: string, otherUserId: string): Promise<string> {
    // For simplicity, we'll create a new room or use a deterministic ID
    const roomId = this.generateChatRoomId(currentUserId, otherUserId);
    
    const roomRef = doc(this.db, "chats", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      // Create new chat room
      await setDoc(roomRef, {
        participants: [currentUserId, otherUserId],
        participantNames: {},
        participantAvatars: {},
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0
        },
        createdAt: serverTimestamp()
      });
    }

    return roomId;
  }

  /**
   * Generate a deterministic chat room ID
   */
  private generateChatRoomId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Send a text message
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    message: string,
    replyTo?: string
  ): Promise<string> {
    return this.sendMessageWithMedia(chatId, senderId, message, undefined, undefined, undefined, replyTo);
  }

  /**
   * Send a message with optional media (image/audio) or location
   */
  async sendMessageWithMedia(
    chatId: string,
    senderId: string,
    message: string,
    imageUrl?: string,
    audioUrl?: string,
    location?: ChatLocation,
    replyTo?: string
  ): Promise<string> {
    const messagesRef = collection(this.db, "chats", chatId, "messages");
    
    // Build message data - exclude undefined fields
    const messageData: Record<string, unknown> = {
      id: crypto.randomUUID(),
      senderId,
      message,
      timestamp: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (replyTo !== undefined) messageData.replyTo = replyTo;
    if (imageUrl !== undefined) messageData.imageUrl = imageUrl;
    if (audioUrl !== undefined) messageData.audioUrl = audioUrl;
    if (location !== undefined) messageData.location = location;

    const messageRef = await addDoc(messagesRef, messageData);

    // Update chat room with last message and increment unread count
    const chatRef = doc(this.db, "chats", chatId);
    
    // Get current chat data to find the other participant
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chatData = chatSnap.data() as DocumentData;
      const otherParticipant = chatData.participants.find((p: string) => p !== senderId);

      await updateDoc(chatRef, {
        lastMessage: message || this.getMediaPlaceholder(imageUrl, audioUrl, location),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherParticipant}`]: increment(1)
      });
    }

    return messageRef.id;
  }

  /**
   * Get placeholder text for media messages
   */
  private getMediaPlaceholder(imageUrl?: string, audioUrl?: string, location?: ChatLocation): string {
    if (imageUrl) return "📷 صورة";
    if (audioUrl) return "🎤 رسالة صوتية";
    if (location) return "📍 موقع";
    return "";
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToMessages(
    chatId: string,
    onMessage: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const messagesRef = collection(this.db, "chats", chatId, "messages");
    const q = query(
      messagesRef,
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, 
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            message: data.message || "",
            timestamp: data.timestamp as { _seconds: number; _nanoseconds: number } | FieldValue,
            replyTo: data.replyTo,
            imageUrl: data.imageUrl,
            audioUrl: data.audioUrl,
            location: data.location
          };
        });
        // Reverse to show newest at bottom when sorted descending
        onMessage(messages.reverse());
      },
      (error) => {
        console.error("Error listening to messages:", error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Mark messages as read for a specific chat
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const chatRef = doc(this.db, "chats", chatId);
    
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  }

  /**
   * Update user info in chat room (name/avatar)
   */
  async updateParticipantInfo(
    chatId: string, 
    userId: string, 
    name: string, 
    avatar: string
  ): Promise<void> {
    const chatRef = doc(this.db, "chats", chatId);
    
    await updateDoc(chatRef, {
      [`participantNames.${userId}`]: name,
      [`participantAvatars.${userId}`]: avatar
    });
  }

  /**
   * Format timestamp for display
   */
  formatMessageTime(timestamp: Timestamp | { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number } | FieldValue | undefined | null): string {
    if (!timestamp) return "";
    
    try {
      // Handle Firestore Timestamp instance
      let seconds: number;
      
      // Check if it's a Firestore Timestamp instance
      if (timestamp instanceof Timestamp) {
        seconds = timestamp.seconds;
      } 
      // Check for plain object with .seconds property
      else if ('seconds' in timestamp && typeof timestamp === 'object') {
        seconds = (timestamp as { seconds: number }).seconds;
      }
      // Check for plain object with ._seconds property (legacy format)
      else if ('_seconds' in timestamp && typeof timestamp === 'object') {
        seconds = (timestamp as { _seconds: number })._seconds;
      }
      // Handle serverTimestamp
      else if ((timestamp as FieldValue) === serverTimestamp()) {
        return "";
      }
      else {
        return "";
      }
      
      const date = new Date(seconds * 1000);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return "أمس";
      } else if (diffDays < 7) {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[date.getDay()];
      } else {
        return date.toLocaleDateString('ar-EG');
      }
    } catch {
      return "";
    }
  }

  /**
   * Get formatted message text based on type
   */
  getMessageDisplayText(message: ChatMessage): string {
    if (message.imageUrl) {
      return message.message ? `📷 ${message.message}` : "📷 صورة";
    }
    if (message.audioUrl) {
      return message.message ? `🎤 ${message.message}` : "🎤 رسالة صوتية";
    }
    if (message.location) {
      return message.message ? `📍 ${message.message}` : "📍 مشاركة موقع";
    }
    return message.message;
  }
}

export const chatService = new ChatService();

