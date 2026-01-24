import Image from "next/image";
import { Transaction } from "@/lib/api/types/common.types";
import styles from "@/styles/transaction/transactionDetailsModal.module.css";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailsModal = ({ isOpen, onClose, transaction }: TransactionDetailsModalProps) => {
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
      return {
        date: timestamp.toLocaleDateString("ar-EG"),
        time: timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
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
      case "BOUNS":
        return "/icons/product-money.svg";
      default:
        return "/icons/product-money.svg";
    }
  };

  const getTransactionTitle = (type: Transaction["type"]) => {
    switch (type) {
      case "COMMISSION":
        return "عمولة";
      case "COD":
        return "الدفع عند الاستلام";
      case "PENALTY":
        return "غرامة";
      case "BOUNS":
        return "بونص";
      case "WITHDRAWAL":
        return "سحب";
      case "DEPOSIT":
        return "إيداع";
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
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>تفاصيل العملية</h2>
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
            {getAmountSign(transaction.amount)}{Math.abs(transaction.amount)} {transaction.currency || "جنيه"}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>رقم العملية</span>
            <span className={styles.detailValue}>{transaction.id}</span>
          </div>

          {transaction.orignal && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>المرجع</span>
              <span className={styles.detailValue}>{transaction.orignal}</span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>الرصيد قبل العملية</span>
            <span className={styles.detailValue}>
              {transaction.balanceBefore?.toFixed(2) || "-"} {transaction.currency || "جنيه"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>الرصيد بعد العملية</span>
            <span className={styles.detailValue}>
              {transaction.balanceAfter?.toFixed(2) || "-"} {transaction.currency || "جنيه"}
            </span>
          </div>

          {transaction.method && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>طريقة الدفع</span>
              <span className={styles.detailValue}>{transaction.method}</span>
            </div>
          )}

          {transaction.reason && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>السبب</span>
              <span className={styles.detailValue}>{transaction.reason}</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalButton} onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

