import { FieldValue } from "firebase/firestore";

// Chat Message Types
export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: { _seconds: number; _nanoseconds: number } | FieldValue;
  replyTo?: string;
  imageUrl?: string;
  audioUrl?: string;
  location?: ChatLocation;
}

export interface ChatLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// Chat Room Types
export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  lastMessage: string;
  lastMessageTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  unreadCount: Record<string, number>;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Chat Room with computed fields
export interface ChatRoomWithDetails extends ChatRoom {
  otherParticipantName: string;
  otherParticipantAvatar: string;
  unread: number;
  formattedTime: string;
}

// Message input types
export interface SendMessageInput {
  chatId: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  location?: ChatLocation;
  replyTo?: string;
}

