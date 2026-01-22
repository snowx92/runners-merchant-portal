"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/home/messages.module.css";

interface Message {
  id: number;
  name: string;
  text: string;
  avatar: string;
  time: string;
  unread?: boolean;
}

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
}

// Mock data for messages
const mockMessages: Message[] = [
  {
    id: 1,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
    unread: true,
  },
  {
    id: 2,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
  {
    id: 3,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
  {
    id: 4,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
  {
    id: 5,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
  {
    id: 6,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
  {
    id: 7,
    name: "محمد الأحمد",
    text: "هذا النص هو مثال لنص يستبدل...",
    avatar: "/public/navLogo.png",
    time: "9:12 PM",
  },
];

// Mock data for chat messages
const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    text: "وعليكم السلام و رحمة الله",
    time: "9:12 PM",
    isOwn: false,
  },
  {
    id: 2,
    text: "هذا النص هو مثال لنص يمكن استبداله",
    time: "9:12 PM",
    isOwn: true,
  },
  {
    id: 3,
    text: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق،",
    time: "9:12 PM",
    isOwn: false,
  },
  {
    id: 4,
    text: "هذا النص هو مثال",
    time: "9:12 PM",
    isOwn: true,
  },
  {
    id: 5,
    text: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة",
    time: "9:12 PM",
    isOwn: false,
  },
];

export const MessageDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Message | null>(null);

  const handleToggleDrawer = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedChat(null);
    }
  };

  const handleChatClick = (message: Message) => {
    setSelectedChat(message);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedChat(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={styles.floatingButton}
        onClick={handleToggleDrawer}
        aria-label="الرسائل"
      >

        <span className={styles.floatingButtonText}>الرسائل</span>
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

      {/* Drawer Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleCloseDrawer}></div>
      )}

      {/* Messages List Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
                        <h2 className={styles.drawerTitle}>الرسائل</h2>
            <button
              className={styles.closeButton}
              onClick={handleCloseDrawer}
              aria-label="إغلاق"
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
            {mockMessages.map((message) => (
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Drawer (opens to the left) */}
      {selectedChat && (
        <div className={`${styles.chatDrawer} ${selectedChat ? styles.chatDrawerOpen : ""}`}>
          <div className={styles.chatView}>
            <div className={styles.chatHeader}>

              <div className={styles.chatHeaderLeft}>
                <button className={styles.chatMenuButton}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                  </svg>
                </button>
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
                  <p className={styles.chatUserStatus}>متواجد الان</p>
                </div>
              </div>
            </div>

            <div className={styles.chatMessages}>
              {mockChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.chatMessageWrapper} ${
                    msg.isOwn ? styles.ownMessage : styles.otherMessage
                  }`}
                >
                  <div
                    className={`${styles.chatMessageBubble} ${
                      msg.isOwn
                        ? styles.ownMessageBubble
                        : styles.otherMessageBubble
                    }`}
                  >
                    <p className={styles.chatMessageText}>{msg.text}</p>
                  </div>
                  <span className={styles.chatMessageTime}>{msg.time}</span>
                </div>
              ))}
            </div>

            <div className={styles.chatInput}>

              <input
                type="text"
                className={styles.messageInput}
                placeholder="اكتب رسالتك هنا.."
                dir="rtl"
              />
                            <button className={styles.attachButton}>
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
              <button className={styles.sendButton}>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
