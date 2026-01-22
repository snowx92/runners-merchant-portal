"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/transaction/withdrawModal.module.css";
import { commonService } from "@/lib/api/services/commonService";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const WithdrawModal = ({ isOpen, onClose, currentBalance }: WithdrawModalProps) => {
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
      alert("Please enter a valid amount within your balance.");
      return;
    }
    if (!accountNumber) {
      alert("Please enter a valid account number.");
      return;
    }

    setIsLoading(true);
    try {
      await commonService.requestPayout({
        amount: Number(amount),
        method: withdrawMethod,
        accountNumber: accountNumber
      });
      alert("Withdrawal request submitted successfully.");
      onClose();
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Failed to submit withdrawal request.");
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
          <h2 className={styles.modalTitle}>سحب الرصيد</h2>

          {/* Available Balance */}
          <div className={styles.balanceSection} style={{ textAlign: 'center' }}>
            <p className={styles.balanceLabel}>الرصيد المتاح للسحب</p>
            <p className={styles.balanceAmount}>
              <span className={styles.amount}>{currentBalance}</span> جنيه
            </p>
          </div>

          {/* Amount Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>المبلغ</label>
            <input
              type="text"
              className={styles.input}
              placeholder="ادخل المبلغ هنا"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Withdraw Method */}
          <div className={styles.formGroup}>
            <label className={styles.label}>طريقة السحب</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              >
                <option value="vodafone">فودافون</option>
                <option value="etisalat">اتصالات</option>
                <option value="orange">اورانج</option>
                <option value="aman">امان</option>
                <option value="bank_wallet">محفظه بنكيه</option>
                <option value="bank_card">بطاقه بنكيه</option>
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
            <label className={styles.label}>رقم الحساب</label>
            <input
              type="text"
              className={styles.input}
              placeholder="ادخل رقم الحساب"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          {/* Helper Text */}
          <p className={styles.helperText}>
            رقم محفظة الهاتف او انستاباي
          </p>

          {/* Fees Info */}
          <p className={styles.feesText}>
            رسوم السحب 2% + 1 جنيه، بحد أدني 5 جنيه
          </p>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              رجوع
            </button>
            <button
              className={styles.withdrawButton}
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              {isLoading ? "جاري المعالجة..." : "سحب الرصيد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
