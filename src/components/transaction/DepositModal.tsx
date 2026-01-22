"use client";

import { useState } from "react";
import styles from "@/styles/transaction/depositModal.module.css";
import { commonService } from "@/lib/api/services/commonService";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || !paymentMethod) {
      alert("Please enter a valid amount and select a payment method.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await commonService.deposit({
        amount: Number(amount),
        method: paymentMethod
      });

      if (response && response.data && response.data.link) {
        // Redirect to payment link
        window.location.href = response.data.link;
      } else {
        alert("Failed to initiate deposit. Please try again.");
      }
    } catch (error) {
      console.error("Deposit failed", error);
      alert("An error occurred during deposit.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {/* Header */}
          <h2 className={styles.modalTitle}>إيداع رصيد</h2>
          <p className={styles.subtitle}>قم بإيداع مبلغ في رصيدك</p>

          {/* Payment Method Selection */}
          <div className={styles.paymentMethods}>
            <button
              className={`${styles.paymentCard} ${paymentMethod === "wallet" ? styles.paymentCardActive : ""
                }`}
              onClick={() => setPaymentMethod("wallet")}
            >
              <div className={styles.paymentContent}>
                <div className={styles.iconWrapper}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="8"
                      width="24"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="4"
                      y1="14"
                      x2="28"
                      y2="14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className={styles.paymentText}>
                  <h3 className={styles.paymentTitle}>محفظة</h3>
                  <p className={styles.paymentDescription}>
                    اختر محفظة الهاتف للدفع
                  </p>
                </div>
              </div>
            </button>

            <button
              className={`${styles.paymentCard} ${paymentMethod === "card" ? styles.paymentCardActive : ""
                }`}
              onClick={() => setPaymentMethod("card")}
            >
              <div className={styles.paymentContent}>
                <div className={styles.iconWrapper}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="8"
                      width="24"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="4"
                      y1="14"
                      x2="28"
                      y2="14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="8"
                      y="18"
                      width="8"
                      height="2"
                      rx="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </div>
                <div className={styles.paymentText}>
                  <h3 className={styles.paymentTitle}>بطاقة</h3>
                  <p className={styles.paymentDescription}>
                    اختر بطاقة بنكية للدفع
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Amount Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>الرصيد</label>
            <input
              type="text"
              className={styles.input}
              placeholder="ادخل الرصيد هنا"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              رجوع
            </button>
            <button
              className={styles.depositButton}
              onClick={handleDeposit}
              disabled={isLoading}
            >
              {isLoading ? "جاري المعالجة..." : "إيداع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
