"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "@/styles/transaction/depositModal.module.css";
import { commonService } from "@/lib/api/services/commonService";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const t = useTranslations('wallet.depositModal');
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
      alert(t('invalidInput'));
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
        alert(t('failed'));
      }
    } catch (error) {
      console.error("Deposit failed", error);
      alert(t('error'));
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
          <h2 className={styles.modalTitle}>{t('title')}</h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>

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
                  <h3 className={styles.paymentTitle}>{t('wallet')}</h3>
                  <p className={styles.paymentDescription}>
                    {t('walletDescription')}
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
                  <h3 className={styles.paymentTitle}>{t('card')}</h3>
                  <p className={styles.paymentDescription}>
                    {t('cardDescription')}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Amount Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('amount')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              {t('back')}
            </button>
            <button
              className={styles.depositButton}
              onClick={handleDeposit}
              disabled={isLoading}
            >
              {isLoading ? t('processing') : t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
