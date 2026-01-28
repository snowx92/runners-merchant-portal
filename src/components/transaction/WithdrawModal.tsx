"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import styles from "@/styles/transaction/withdrawModal.module.css";
import { commonService } from "@/lib/api/services/commonService";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const WithdrawModal = ({ isOpen, onClose, currentBalance }: WithdrawModalProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('wallet.withdrawModal');
  const tCommon = useTranslations('common');
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("vodafone");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) > currentBalance) {
      alert(t('invalidAmount'));
      return;
    }
    if (!accountNumber) {
      alert(t('invalidAccount'));
      return;
    }

    setIsLoading(true);
    try {
      await commonService.requestPayout({
        amount: Number(amount),
        method: withdrawMethod,
        accountNumber: accountNumber
      });
      alert(t('success'));
      onClose();
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert(t('failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.modalContent}>
          {/* Header */}
          <h2 className={styles.modalTitle}>{t('title')}</h2>

          {/* Available Balance */}
          <div className={styles.balanceSection} style={{ textAlign: 'center' }}>
            <p className={styles.balanceLabel}>{t('availableBalance')}</p>
            <p className={styles.balanceAmount}>
              <span className={styles.amount}>{currentBalance}</span> {tCommon('currency')}
            </p>
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

          {/* Withdraw Method */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('method')}</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              >
                <option value="vodafone">{t('vodafone')}</option>
                <option value="etisalat">{t('etisalat')}</option>
                <option value="orange">{t('orange')}</option>
                <option value="aman">{t('aman')}</option>
                <option value="bank_wallet">{t('bankWallet')}</option>
                <option value="bank_card">{t('bankCard')}</option>
              </select>
              <svg
                className={styles.selectIcon}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Account Number */}
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('accountNumber')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('accountNumberPlaceholder')}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {/* Helper Text */}
          <p className={styles.helperText}>
            {t('accountHelper')}
          </p>

          {/* Fees Info */}
          <p className={styles.feesText}>
            {t('fees')}
          </p>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              {t('back')}
            </button>
            <button
              className={styles.withdrawButton}
              onClick={handleWithdraw}
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
