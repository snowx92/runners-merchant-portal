import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Transaction } from "@/lib/api/types/common.types";
import styles from "@/styles/transaction/transactionDetailsModal.module.css";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailsModal = ({ isOpen, onClose, transaction }: TransactionDetailsModalProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('wallet');
  const tDetails = useTranslations('wallet.transactionDetails');
  if (!isOpen || !transaction) return null;

  const formatDate = (date: string | { _seconds: number; _nanoseconds: number }) => {
    try {
      let timestamp: Date;
      if (date && typeof date === "object" && "_seconds" in date) {
        timestamp = new Date(date._seconds * 1000);
      } else if (typeof date === "string") {
        timestamp = new Date(date);
      } else {
        return { date: "", time: "" };
      }

      // Manually format date to ensure Western numerals (avoiding browser locale interference from dir="rtl")
      const month = String(timestamp.getMonth() + 1).padStart(2, '0');
      const day = String(timestamp.getDate()).padStart(2, '0');
      const year = timestamp.getFullYear();
      const hours = String(timestamp.getHours()).padStart(2, '0');
      const minutes = String(timestamp.getMinutes()).padStart(2, '0');

      return {
        date: `${month}/${day}/${year}`,
        time: `${hours}:${minutes}`,
      };
    } catch {
      return { date: "", time: "" };
    }
  };

  const { date, time } = formatDate(transaction.date);

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "COMMISSION":
        return "/icons/Upload.png";
      case "COD":
        return "/icons/Download.png";
      case "PENALTY":
        return "/icons/product-money.svg";
      case "BONUS":
        return "/icons/product-money.svg";
      default:
        return "/icons/product-money.svg";
    }
  };

  const getTransactionTitle = (type: Transaction["type"]) => {
    switch (type) {
      case "COMMISSION":
        return t('transactionTypes.commission');
      case "COD":
        return t('transactionTypes.cod');
      case "PENALTY":
        return t('transactionTypes.penalty');
      case "BONUS":
        return t('transactionTypes.bonus');
      case "WITHDRAWAL":
        return t('transactionTypes.withdrawal');
      case "DEPOSIT":
        return t('transactionTypes.deposit');
      default:
        return type;
    }
  };

  const getAmountClass = (amount: number) => {
    return amount >= 0 ? styles.amountPositive : styles.amountNegative;
  };

  const getAmountSign = (amount: number) => {
    return amount >= 0 ? "+" : "";
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{tDetails('title')}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.transactionCard}>
          <div className={styles.transactionIconWrapper}>
            <Image
              src={getTransactionIcon(transaction.type)}
              alt={transaction.type}
              width={32}
              height={32}
            />
          </div>

          <div className={styles.transactionInfo}>
            <h3 className={styles.transactionTitle}>{getTransactionTitle(transaction.type)}</h3>
            <p className={styles.transactionDate}>{date} - {time}</p>
          </div>

          <div className={`${styles.transactionAmount} ${getAmountClass(transaction.amount)}`}>
            {getAmountSign(transaction.amount)}{Math.abs(transaction.amount)} {transaction.currency || "EGP"}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{tDetails('transactionId')}</span>
            <span className={styles.detailValue}>{transaction.id}</span>
          </div>

          {transaction.orignal && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{tDetails('reference')}</span>
              <span className={styles.detailValue}>{transaction.orignal}</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{tDetails('balanceBefore')}</span>
            <span className={styles.detailValue}>
              {transaction.balanceBefore?.toFixed(2) || "-"} {transaction.currency || "EGP"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{tDetails('balanceAfter')}</span>
            <span className={styles.detailValue}>
              {transaction.balanceAfter?.toFixed(2) || "-"} {transaction.currency || "EGP"}
            </span>
          </div>

          {transaction.method && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{tDetails('paymentMethod')}</span>
              <span className={styles.detailValue}>{transaction.method}</span>
            </div>
          )}

          {transaction.reason && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{tDetails('reason')}</span>
              <span className={styles.detailValue}>{transaction.reason}</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalButton} onClick={onClose}>
            {tDetails('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

