/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import styles from "@/styles/setting/apiKeys.module.css";
import { Cairo } from "next/font/google";
import { customerService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/ToastContext";
import type { ApiKey } from "@/lib/api/types/common.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function ApiKeysPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await customerService.getApiKeys();
      if (response && response.data) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      showToast("فشل في جلب مفاتيح API", "error");
    } finally {
      setLoading(false);
    }
  };

    const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      showToast("يرجى إدخال اسم للمفتاح", "error");
      return;
    }

    setCreating(true);
    try {
      const response = await customerService.createApiKey({ name: newKeyName });
      if (response && response.data) {
        setApiKeys([response.data, ...apiKeys]);
        showToast("تم إنشاء مفتاح API بنجاح", "success");
        setShowCreateModal(false);
        setNewKeyName("");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      showToast("فشل في إنشاء مفتاح API", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKey) return;

    setDeletingId(selectedKey.id);
    try {
      await customerService.deleteApiKey(selectedKey.id);
      setApiKeys(apiKeys.filter((k) => k.id !== selectedKey.id));
      showToast("تم حذف مفتاح API بنجاح", "success");
      setShowDeleteModal(false);
      setSelectedKey(null);
    } catch (error) {
      console.error("Error deleting API key:", error);
      showToast("فشل في حذف مفتاح API", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className={styles.pageTitle}>مفاتيح API</h1>
          </div>
          <button className={styles.addButton} onClick={() => setShowCreateModal(true)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4.16667V15.8333M4.16667 10H15.8333"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            إضافة مفتاح جديد
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>جاري تحميل المفاتيح...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className={styles.keyCard}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 7.5V10.8333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="13.3333" r="0.833333" fill="currentColor" />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>لا توجد مفاتيح API</h3>
              <p className={styles.emptyDescription}>
                لم تقم بإنشاء أي مفاتيح API بعد. انقر على زر إضافة مفتاح جديد للبدء.
              </p>
              <button className={styles.addButton} onClick={() => setShowCreateModal(true)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4.16667V15.8333M4.16667 10H15.8333"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                إضافة مفتاح جديد
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.keysList}>
            {apiKeys.map((key) => (
              <div key={key.id} className={styles.keyCard}>
                <div className={styles.keyHeader}>
                  <h3 className={styles.keyName}>{key.name}</h3>
                  <div className={`${styles.keyStatus} ${key.isActive ? styles.active : styles.inactive}`}>
                    <span className={styles.statusDot}></span>
                    <span className={styles.statusText}>
                      {key.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                </div>

                <div className={styles.keyInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>المفتاح</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className={styles.infoValue}>{key.apiKeyMasked}</span>
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopyKey(key.apiKeyMasked)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.33333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V15.8333C2.5 16.7548 3.24619 17.5 4.16667 17.5H15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.5 3.33333H15.8333C16.7538 3.33333 17.5 4.07952 17.5 5V15.8333C17.5 16.7548 16.7538 17.5 15.8333 17.5H7.5V3.33333Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        نسخ
                      </button>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>تاريخ الإنشاء</span>
                    <span className={styles.infoValue}>{formatDate(key.createdAt)}</span>
                  </div>

                  {key.lastUsedAt && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>آخر استخدام</span>
                      <span className={styles.infoValue}>{formatDate(key.lastUsedAt as unknown as { _seconds: number; _nanoseconds: number })}</span>
                    </div>
                  )}
                </div>

                <div className={styles.keyActions}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      setSelectedKey(key);
                      setShowDeleteModal(true);
                    }}
                    disabled={deletingId === key.id}
                  >
                    {deletingId === key.id ? (
                      "جاري الحذف..."
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 5H4.16667H17.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.66699 5.00016V3.3335C6.66699 2.89147 6.84259 2.46769 7.15515 2.16513C7.46771 1.86257 7.8915 1.68697 8.33353 1.68697H11.667C12.109 1.68697 12.5328 1.86257 12.8454 2.16513C13.1579 2.46769 13.3335 2.89147 13.3335 3.3335V5.00016M15.8337 5.00016V16.6668C15.8337 17.1089 15.6581 17.5327 15.3455 17.8452C15.0329 18.1578 14.6091 18.3335 14.167 18.3335H5.83366C5.39163 18.3335 4.96784 18.1578 4.65528 17.8452C4.34272 17.5327 4.16699 17.1089 4.16699 16.6668V5.00016H15.8337Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        حذف المفتاح
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#E0F2FE" />
                <path
                  d="M24 14V26M24 32H24.01"
                  stroke="#0EA5E9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={styles.modalTitle}>إنشاء مفتاح API جديد</h2>
            <p className={styles.modalMessage}>
              أدخل اسماً وصفياً للمفتاح الجديد لمساعدتك في التعرف عليه لاحقاً.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>اسم المفتاح</label>
              <input
                type="text"
                className={styles.input}
                placeholder="مثال: مفتاح للمتجر الرئيسي"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              />
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                إلغاء
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleCreateKey}
                disabled={creating}
              >
                {creating ? "جاري الإنشاء..." : "إنشاء المفتاح"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Key Modal */}
      {showDeleteModal && selectedKey && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#FEE2E2" />
                <path
                  d="M24 16V24M24 32H24.01"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={styles.modalTitle}>حذف مفتاح API</h2>
            <p className={styles.modalMessage}>
              هل أنت متأكد من حذف مفتاح <strong>{selectedKey.name}</strong>؟
              هذا الإجراء لا يمكن التراجع عنه وسيتم فقدان الوصول المرتبط بهذا المفتاح.
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
                disabled={!!deletingId}
              >
                إلغاء
              </button>
              <button
                className={styles.confirmButton}
                style={{ background: "#DC2626" }}
                onClick={handleDeleteKey}
                disabled={!!deletingId}
              >
                {deletingId ? "جاري الحذف..." : "حذف المفتاح"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copied && (
        <div className={styles.copiedToast}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: "0.5rem" }}
          >
            <path
              d="M16.6667 5L7.50001 14.1667L3.33334 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          تم نسخ المفتاح
        </div>
      )}

      <MessageDrawer />
      <LoadingOverlay isLoading={creating} />
    </main>
  );
}

