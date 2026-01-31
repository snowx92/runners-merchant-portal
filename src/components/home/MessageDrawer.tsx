/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { chatService } from "@/lib/api/services/chatService";
import { commonService } from "@/lib/api/services/commonService";
import type { ChatLocation, ChatMessage } from "@/lib/api/types/chat.types";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";
import { useChatCount } from "@/lib/hooks/useChatCount";
import { SessionManager } from "@/lib/utils/session";
import styles from "@/styles/home/messages.module.css";
import {
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  name: string;
  text: string;
  avatar: string;
  time: string;
  unread?: boolean;
  lastMessage?: string;
  chatId?: string;
  timestamp?: { _seconds: number; _nanoseconds: number } | null;
}

interface ChatMessageUI {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  type: "text" | "image" | "audio" | "location";
  imageUrl?: string;
  audioUrl?: string;
  location?: ChatLocation;
}

// Mock data for messages (fallback when no chats exist)
const mockMessages: Message[] = [];

export const MessageDrawer = () => {
  const { isLoggedIn } = useAuth();
  const t = useTranslations("messages");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessageUI[]>([]);
  const [, setError] = useState<string | null>(null);

  // Use real-time chat count from Firestore
  const { unreadCount: realTimeUnreadCount } = useChatCount();
  const [unreadCount, setUnreadCount] = useState(0);
  const chatUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const messagesUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Media handling state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  // Loading states
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // Balance state for chat restriction
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when drawer opens and when messages change
  useEffect(() => {
    if (isOpen && chatMessages.length > 0) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => scrollToBottom("auto"), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, chatMessages.length, selectedChat?.chatId]);

  // Also scroll when a new message is added
  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [chatMessages]);

  // Sync real-time count to local state
  useEffect(() => {
    if (realTimeUnreadCount > 0 || realTimeUnreadCount === 0) {
      setUnreadCount(realTimeUnreadCount);
    }
  }, [realTimeUnreadCount]);

  // Get current user ID using SessionManager
  const getCurrentUserId = (): string | null => {
    const sessionManager = SessionManager.getInstance();
    const user = sessionManager.getUser<{ uid: string }>();

    // Fallback to localStorage if needed
    const localUserData = localStorage.getItem("user");
    const localUser = localUserData ? JSON.parse(localUserData) : null;

    const finalUser = user || localUser;
    return finalUser?.uid || null;
  };

  // Set up real-time listener for chat rooms
  useEffect(() => {
    if (!isLoggedIn) return;

    const userId = getCurrentUserId();
    if (!userId) {
      console.log("MessageDrawer - No user ID found");
      setIsLoading(false);
      return;
    }
    currentUserIdRef.current = userId;
    console.log("MessageDrawer - User ID:", userId);

    const db = getFirebaseDb();
    const chatsRef = collection(db, "chats");
    const chatsQuery = query(
      chatsRef,
      where("participants", "array-contains", userId),
      where("lastMessage", "!=", ""),
      orderBy("lastMessageTime", "desc"),
    );

    chatUnsubscribeRef.current = onSnapshot(
      chatsQuery,
      (snapshot) => {
        console.log("MessageDrawer - Chats snapshot size:", snapshot.size);

        const chatsData: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          console.log("MessageDrawer - Chat doc:", doc.id, data);

          const otherParticipant = data["participants"]?.find(
            (p: string) => p !== userId,
          );

          // Calculate unread count for this chat
          const unreadCounts = data["unreadCount"] as
            | Record<string, number>
            | undefined;
          const chatUnread = unreadCounts?.[userId] || 0;

          // Get last message time
          const lastMessageTime = data["lastMessageTime"];
          const formattedTime = chatService.formatMessageTime(lastMessageTime);

          // Get user info from usersInfo object
          const usersInfo = data["usersInfo"] as
            | Record<string, { avatar?: string; name?: string }>
            | undefined;
          const otherUserInfo = usersInfo?.[otherParticipant] || {};

          return {
            id: doc.id,
            chatId: doc.id,
            name: otherUserInfo?.name || t("user"),
            text: data["lastMessage"] || t("noMessagesDefault"),
            avatar: otherUserInfo?.avatar || "/icons/Profile.svg",
            time: formattedTime,
            unread: chatUnread > 0,
            timestamp: lastMessageTime, // Store for sorting
          };
        });

        // Sort chats by lastMessageTime descending (newest first)
        chatsData.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;

          // Handle Firestore Timestamp instances and plain objects
          let timeA: number;
          let timeB: number;

          // Check if it's a Firestore Timestamp instance
          if (a.timestamp instanceof Date) {
            timeA = a.timestamp.getTime();
          } else if (
            a.timestamp &&
            typeof a.timestamp === "object" &&
            "seconds" in a.timestamp
          ) {
            timeA = (a.timestamp as { seconds: number }).seconds * 1000;
          } else if (
            a.timestamp &&
            typeof a.timestamp === "object" &&
            "_seconds" in a.timestamp
          ) {
            timeA = (a.timestamp as { _seconds: number })._seconds * 1000;
          } else {
            timeA = 0;
          }

          if (b.timestamp instanceof Date) {
            timeB = b.timestamp.getTime();
          } else if (
            b.timestamp &&
            typeof b.timestamp === "object" &&
            "seconds" in b.timestamp
          ) {
            timeB = (b.timestamp as { seconds: number }).seconds * 1000;
          } else if (
            b.timestamp &&
            typeof b.timestamp === "object" &&
            "_seconds" in b.timestamp
          ) {
            timeB = (b.timestamp as { _seconds: number })._seconds * 1000;
          } else {
            timeB = 0;
          }

          return timeB - timeA;
        });

        setMessages(chatsData.length > 0 ? chatsData : mockMessages);
        setIsLoading(false);
        if (snapshot.size === 0) {
          setError(t("noConversations"));
        } else {
          setError(null);
        }
      },
      (snapshotError) => {
        console.error("Error listening to chats:", snapshotError);
        setError(snapshotError.message);
        setIsLoading(false);
      },
    );

    return () => {
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Listen for "open chat with user" (e.g. from order details courier contact)
  useEffect(() => {
    const handler = async (e: Event) => {
      const customEvent = e as CustomEvent<{
        userId: string;
        name: string;
        avatar: string;
      }>;
      const { userId, name, avatar } = customEvent.detail || {};
      if (!userId || !name) return;

      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const canOpen = await checkBalanceAndProceed();
      if (!canOpen) return;

      try {
        const chatId = await chatService.getOrCreateChatRoom(
          currentUserId,
          userId,
        );

        // Update participant info (store courier's name and avatar in chat room)
        await chatService.updateParticipantInfo(chatId, userId, name, avatar);

        const syntheticMessage: Message = {
          id: chatId,
          chatId,
          name,
          avatar: avatar || "/icons/Profile.svg",
          text: "",
          time: "",
        };
        setSelectedChat(syntheticMessage);
        setIsOpen(true);
      } catch (err) {
        console.error("Error opening chat with user:", err);
      }
    };

    window.addEventListener("openChatWithUser", handler);
    return () => window.removeEventListener("openChatWithUser", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handler uses getCurrentUserId/checkBalanceAndProceed, stable
  }, []);

  // Subscribe to messages when a chat is selected
  useEffect(() => {
    if (!selectedChat?.chatId || !currentUserIdRef.current) return;

    const chatId = selectedChat.chatId;
    const userId = currentUserIdRef.current;

    messagesUnsubscribeRef.current = chatService.subscribeToMessages(
      chatId,
      (msgs: ChatMessage[]) => {
        const uiMessages: ChatMessageUI[] = msgs.map((msg) => ({
          id: msg.id,
          text: chatService.getMessageDisplayText(msg),
          time: chatService.formatMessageTime(msg.timestamp),
          isOwn: msg.senderId === userId,
          type: msg.imageUrl
            ? "image"
            : msg.audioUrl
              ? "audio"
              : msg.location
                ? "location"
                : "text",
          imageUrl: msg.imageUrl,
          audioUrl: msg.audioUrl,
          location: msg.location,
        }));
        setChatMessages(uiMessages);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      },
    );

    // Mark messages as read
    chatService.markMessagesAsRead(chatId, userId);

    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
      }
    };
  }, [selectedChat?.chatId]);

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedChat(null);
      setChatMessages([]);
    }
  };

  const handleChatClick = async (message: Message) => {
    // Check balance before opening chat
    const canOpenChat = await checkBalanceAndProceed();
    if (!canOpenChat) {
      return;
    }

    setSelectedChat(message);
    setChatMessages([]);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setChatMessages([]);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedChat(null);
    setChatMessages([]);
  };

  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !selectedChat?.chatId ||
      !currentUserIdRef.current
    )
      return;

    try {
      await chatService.sendMessage(
        selectedChat.chatId,
        currentUserIdRef.current,
        messageInput.trim(),
      );
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check user balance before allowing chat
  const checkBalanceAndProceed = async (): Promise<boolean> => {
    try {
      setIsCheckingBalance(true);
      const response = await commonService.getBalance();

      if (response.data && typeof response.data.balance === "number") {
        const balance = response.data.balance;

        if (balance < 5) {
          alert(t("balanceError"));
          setIsCheckingBalance(false);
          return false;
        }

        setIsCheckingBalance(false);
        return true;
      }

      setIsCheckingBalance(false);
      return true; // Allow if we can't get balance
    } catch (error) {
      console.error("Error checking balance:", error);
      setIsCheckingBalance(false);
      return true; // Allow if balance check fails
    }
  };

  // ============ Voice Recording ============
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Only create blob if we're not canceling
        if (chunks.length > 0 && isRecording) {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setAudioBlob(blob);
        }
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Set isRecording to false FIRST to prevent onstop from creating a blob
      setIsRecording(false);

      // Stop all tracks on the stream immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Stop the media recorder
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;

      // Clear the audio blob if it exists
      setAudioBlob(null);

      // Reset timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Reset recording time
      setRecordingTime(0);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedChat?.chatId || !currentUserIdRef.current)
      return;

    setIsSendingVoice(true);

    try {
      const storage = getStorage();
      const audioPath = `chat-audio/${selectedChat.chatId}/${Date.now()}.webm`;
      const audioRef = ref(storage, audioPath);

      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);

      await chatService.sendMessageWithMedia(
        selectedChat.chatId,
        currentUserIdRef.current,
        "",
        undefined,
        audioUrl,
      );

      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error sending voice message:", error);
    } finally {
      setIsSendingVoice(false);
    }
  };

  // ============ Image Upload ============
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat?.chatId || !currentUserIdRef.current) return;

    if (!file.type.startsWith("image/")) {
      alert(t("selectImageFile"));
      return;
    }

    setIsUploadingImage(true);

    try {
      const storage = getStorage();
      const imagePath = `chat-images/${selectedChat.chatId}/${Date.now()}-${file.name}`;
      const imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      await chatService.sendMessageWithMedia(
        selectedChat.chatId,
        currentUserIdRef.current,
        "",
        imageUrl,
      );

      setShowAttachmentMenu(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ============ Location Sharing ============
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t("browserNotSupported"));
      return;
    }

    setIsSendingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get address from coordinates
        let address = "";
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          );
          const data = await response.json();
          address = data.display_name || `${latitude}, ${longitude}`;
        } catch {
          address = `${latitude}, ${longitude}`;
        }

        setUserLocation({ lat: latitude, lng: longitude, address });
        setIsSendingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(t("locationFailed"));
        setIsSendingLocation(false);
      },
    );
  };

  const sendLocation = async () => {
    if (!userLocation || !selectedChat?.chatId || !currentUserIdRef.current)
      return;

    setIsSendingLocation(true);

    try {
      await chatService.sendMessageWithMedia(
        selectedChat.chatId,
        currentUserIdRef.current,
        "",
        undefined,
        undefined,
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          address: userLocation.address,
        },
      );

      setLocationModalOpen(false);
      setUserLocation(null);
      setShowAttachmentMenu(false);
    } catch (error) {
      console.error("Error sending location:", error);
    } finally {
      setIsSendingLocation(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Floating Button */}
      <div className={styles.messageButtonWrapper}>
        <button
          className={styles.floatingButton}
          onClick={handleToggleDrawer}
          aria-label={t("title")}
        >
          <div className={styles.buttonContent}>
            <span className={styles.floatingButtonText}>{t("title")}</span>
            {unreadCount > 0 && (
              <span className={styles.messageBadge}>{unreadCount}</span>
            )}
          </div>
          <svg
            className={styles.chevron}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M18 15L12 9L6 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleCloseDrawer}></div>
      )}

      {/* Messages List Drawer */}
      <div
        className={`${styles.drawer} ${isOpen && !selectedChat ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <h2 className={styles.drawerTitle}>{t("title")}</h2>
            <button
              className={styles.closeButton}
              onClick={handleCloseDrawer}
              aria-label={t("close")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 15L12 9L6 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className={styles.messagesList}>
            {isLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                {t("loading")}
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                {t("noConversations")}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={styles.messageItem}
                  onClick={() => handleChatClick(message)}
                >
                  <div className={styles.messageRight}>
                    <div className={styles.avatarWrapper}>
                      <div className={styles.avatar}>
                        <Image
                          src={message.avatar}
                          alt={message.name}
                          width={48}
                          height={48}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/icons/Profile.svg";
                          }}
                        />
                      </div>
                      {message.unread && (
                        <span className={styles.unreadBadge}>1</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.messageContent}>
                    <p className={styles.messageName}>{message.name}</p>
                    <p className={styles.messageText}>{message.text}</p>
                  </div>
                  <span className={styles.messageTime}>{message.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer (opens to the left) */}
      {selectedChat && (
        <div
          className={`${styles.chatDrawer} ${selectedChat ? styles.chatDrawerOpen : ""}`}
        >
          <div className={styles.chatView}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <button
                  className={styles.chatCloseButton}
                  onClick={handleBackToList}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 12H5M5 12L12 19M5 12L12 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={styles.chatHeaderCenter}>
                <div className={styles.chatAvatar}>
                  <Image
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    width={48}
                    height={48}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/icons/Profile.svg";
                    }}
                  />
                </div>
                <div className={styles.chatUserInfo}>
                  <h3 className={styles.chatUserName}>{selectedChat.name}</h3>
                  <p className={styles.chatUserStatus}>{t("onlineNow")}</p>
                </div>
              </div>
            </div>

            <div className={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    color: "#888",
                  }}
                >
                  {t("noMessagesYet")}
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatMessageWrapper} ${
                      msg.isOwn ? styles.ownMessage : styles.otherMessage
                    }`}
                  >
                    <div
                      className={`${styles.chatMessageBubble} ${
                        msg.isOwn
                          ? msg.type === "text"
                            ? styles.ownMessageBubble
                            : styles.ownMessageBubbleAttachment
                          : msg.type === "text"
                            ? styles.otherMessageBubble
                            : styles.otherMessageBubbleAttachment
                      }`}
                    >
                      {msg.type === "image" && msg.imageUrl && (
                        <div
                          style={{
                            marginBottom: "8px",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                          onClick={() => setPreviewImage(msg.imageUrl || null)}
                        >
                          <Image
                            src={msg.imageUrl}
                            alt="Image"
                            width={200}
                            height={200}
                            style={{
                              borderRadius: "8px",
                              objectFit: "cover",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      {msg.type === "location" && msg.location && (
                        <div
                          style={{
                            marginBottom: "8px",
                            background: "transparent",
                          }}
                        >
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${msg.location.latitude},${msg.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "block",
                              textDecoration: "none",
                              color: "inherit",
                              cursor: "pointer",
                              borderRadius: "12px",
                              overflow: "hidden",
                              background: "transparent",
                              transition:
                                "transform 0.2s ease, box-shadow 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "scale(1.02)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.15)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            {/* Static Map Image */}
                            <div
                              style={{
                                width: "200px",
                                height: "100px",
                                background: "#e0e0e0",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={`https://static-maps.yandex.ru/1.x/?lang=ar-SA&size=200,100&z=15&l=map&pt=${msg.location.longitude},${msg.location.latitude},pm2rdm`}
                                alt={t("map")}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e) => {
                                  // Fallback to Google Static Maps
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                              {/* Map Pin Overlay */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  width: "30px",
                                  height: "30px",
                                  background: "#dc2626",
                                  borderRadius: "50% 50% 50% 0",
                                  transform:
                                    "translate(-50%, -100%) rotate(-45deg)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                }}
                              >
                                <div
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    background: "white",
                                    borderRadius: "50%",
                                    transform: "rotate(45deg)",
                                  }}
                                ></div>
                              </div>
                            </div>
                            {/* Address Label */}
                            <div
                              style={{
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#111",
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  wordBreak: "break-word",
                                  textAlign: "right",
                                  flex: 1,
                                  lineHeight: "1.4",
                                }}
                              >
                                {msg.location.address ||
                                  `${msg.location.latitude.toFixed(5)}, ${msg.location.longitude.toFixed(5)}`}
                              </span>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{ opacity: 0.5, flexShrink: 0 }}
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </div>
                          </a>
                        </div>
                      )}
                      {msg.type === "audio" && msg.audioUrl && (
                        <div
                          style={{
                            marginBottom: "8px",
                            background: "transparent",
                          }}
                        >
                          <audio
                            controls
                            src={msg.audioUrl}
                            style={{
                              width: "200px",
                              background: "transparent",
                            }}
                          />
                        </div>
                      )}
                      <p className={styles.chatMessageText}>
                        {msg.type === "text" ? msg.text : null}
                      </p>
                    </div>
                    <span className={styles.chatMessageTime}>{msg.time}</span>
                  </div>
                ))
              )}

              {/* Invisible element to scroll to bottom */}
              <div ref={chatMessagesEndRef} />
            </div>

            <div className={styles.chatInput}>
              {/* Voice recording preview */}
              {audioBlob && (
                <div className={styles.voicePreview}>
                  <button
                    className={styles.playAudioButton}
                    onClick={() => {
                      const audio = new Audio(URL.createObjectURL(audioBlob));
                      audio.play();
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <polygon
                        points="5 3 19 12 5 21 5 3"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <span className={styles.recordingTime}>
                    {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, "0")}
                  </span>
                  <button
                    className={styles.cancelRecordingButton}
                    onClick={cancelRecording}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button
                    className={`${styles.sendVoiceButton} ${isSendingVoice ? styles.sendingButton : ""}`}
                    onClick={sendVoiceMessage}
                    disabled={isSendingVoice}
                  >
                    {isSendingVoice ? (
                      <div className={styles.loadingSpinner}></div>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Voice recording UI */}
              {isRecording && !audioBlob && (
                <div className={styles.recordingIndicator}>
                  <div className={styles.recordingDot}></div>
                  <span className={styles.recordingLabel}>
                    {t("recording")} {Math.floor(recordingTime / 60)}:
                    {(recordingTime % 60).toString().padStart(2, "0")}
                  </span>
                  <button
                    className={styles.stopRecordingButton}
                    onClick={stopRecording}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Normal input UI */}
              {!isRecording && !audioBlob && (
                <>
                  <button
                    className={styles.attachButton}
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Attachment Menu */}
                  {showAttachmentMenu && (
                    <div className={styles.attachmentMenu}>
                      <label
                        className={`${styles.attachmentMenuItem} ${isUploadingImage ? styles.sendingButton : ""}`}
                        style={{ background: "transparent" }}
                      >
                        {isUploadingImage ? (
                          <div className={styles.loadingSpinnerDark}></div>
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                        <span>{t("image")}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        className={styles.attachmentMenuItem}
                        onClick={() => {
                          setShowAttachmentMenu(false);
                          startRecording();
                        }}
                        style={{ background: "transparent" }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        <span>{t("voiceMessage")}</span>
                      </button>
                      <button
                        className={`${styles.attachmentMenuItem} ${isSendingLocation ? styles.sendingButton : ""}`}
                        onClick={() => {
                          setShowAttachmentMenu(false);
                          getCurrentLocation();
                          setLocationModalOpen(true);
                        }}
                        disabled={isSendingLocation}
                        style={{ background: "transparent" }}
                      >
                        {isSendingLocation ? (
                          <div className={styles.loadingSpinnerDark}></div>
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        )}
                        <span>{t("location")}</span>
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    className={styles.messageInput}
                    placeholder={t("typeMessage")}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className={styles.sendButton}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Location Modal */}
            {locationModalOpen && (
              <div className={styles.locationModal}>
                <div className={styles.locationModalContent}>
                  <h4>{t("shareLocation")}</h4>
                  {userLocation ? (
                    <>
                      <p className={styles.locationAddress}>
                        {userLocation.address}
                      </p>
                      <div className={styles.locationActions}>
                        <button
                          className={`${styles.locationSendButton} ${isSendingLocation ? styles.sendingButton : ""}`}
                          onClick={sendLocation}
                          disabled={isSendingLocation}
                        >
                          {isSendingLocation ? (
                            <div className={styles.loadingSpinner}></div>
                          ) : (
                            t("sendLocation")
                          )}
                        </button>
                        <button
                          className={styles.locationCancelButton}
                          onClick={() => {
                            setLocationModalOpen(false);
                            setUserLocation(null);
                          }}
                          disabled={isSendingLocation}
                        >
                          {t("close")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{t("locatingPosition")}</p>
                      {isSendingLocation && (
                        <div className={styles.loadingOverlay}>
                          <div className={styles.loadingSpinnerDark}></div>
                        </div>
                      )}
                      <button
                        className={styles.locationCancelButton}
                        onClick={() => setLocationModalOpen(false)}
                        disabled={isSendingLocation}
                      >
                        {t("close")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className={styles.imagePreviewModal}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={styles.imagePreviewContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.imagePreviewClose}
              onClick={() => setPreviewImage(null)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className={styles.imagePreviewImage}
            />
          </div>
        </div>
      )}
    </>
  );
};
