"use client";

import { useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { WithdrawModal } from "@/components/transaction/WithdrawModal";
import { DepositModal } from "@/components/transaction/DepositModal";
import styles from "@/styles/transaction/transaction.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { commonService } from "@/lib/api/services/commonService";
import { Transaction } from "@/lib/api/types/common.types";
import { useEffect } from "react";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function TransactionPage() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        commonService.getBalance(),
        commonService.getTransactions()
      ]);

      if (balanceRes && balanceRes.data) {
        setBalance(balanceRes.data.balance);
      }

      if (transactionsRes && transactionsRes.data && transactionsRes.data.items) {
        setTransactions(transactionsRes.data.items);
      }
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Helper to format date
  const formatDate = (date: any) => {
    try {
      if (!date) return "";
      // Handle Firestore timestamp { _seconds, _nanoseconds }
      if (typeof date === 'object' && date._seconds) {
        const d = new Date(date._seconds * 1000);
        return d.toLocaleDateString('ar-EG');
      }
      // Handle standard date string
      return new Date(date).toLocaleDateString('ar-EG');
    } catch (e) {
      return "";
    }
  }

  const getTransactionIcon = (type: string) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === 'deposit') return "/icons/Download.png";
    if (lowerType === 'withdraw' || lowerType === 'withdrawal') return "/icons/Upload.png";
    return "/icons/product-money.svg"; // default/received
  }

  const getTransactionTitle = (transaction: Transaction) => {
    if (transaction.description) {
      if (typeof transaction.description === 'string') {
        return transaction.description;
      }
      return transaction.description.ar || transaction.status || "";
    }
    // Fallbacks if description is missing
    if (transaction.type === 'WITHDRAWAL') return "عملية سحب";
    return transaction.status || "عملية";
  }

  const getTransactionClass = (type: string) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === 'deposit') return styles.iconWrapperDeposit;
    if (lowerType === 'withdraw' || lowerType === 'withdrawal') return styles.iconWrapperWithdraw;
    return styles.iconWrapperReceived;
  }

  const getAmountClass = (type: string) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === 'deposit') return styles.amountDeposit;
    if (lowerType === 'withdraw' || lowerType === 'withdrawal') return styles.amountWithdraw;
    return styles.amountReceived;
  }

  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>المحفظة</h1>

        {/* Balance Card */}
        <div className={styles.balanceCard}>
          <p className={styles.balanceLabel}>الرصيد الحالي</p>
          <h2 className={styles.balanceAmount}>
            <span className={styles.amount}>{balance !== null ? balance : "..."}</span> جنيه
          </h2>
          <div className={styles.buttonGroup}>
            <button
              className={styles.withdrawButton}
              onClick={() => setIsWithdrawModalOpen(true)}
            >
              سحب
            </button>
            <button
              className={styles.depositButton}
              onClick={() => setIsDepositModalOpen(true)}
            >
              إيداع
            </button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className={styles.transactionsSection}>
          <h3 className={styles.sectionTitle}>العمليات</h3>

          <div className={styles.transactionsList}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>لا توجد عمليات</div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.transactionLeft}>
                    <div
                      className={`${styles.iconWrapper} ${getTransactionClass(transaction.type)}`}
                    >
                      <Image
                        src={getTransactionIcon(transaction.type)}
                        alt={transaction.type}
                        width={24}
                        height={24}
                        className={styles.transactionIcon}
                      />
                    </div>
                  </div>
                  <div className={styles.transactionRight}>
                    <div className={styles.transactionInfo}>
                      <p className={styles.transactionTitle}>
                        {getTransactionTitle(transaction)}
                      </p>
                      <p className={styles.transactionDate}>{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className={styles.transactionCenter}>
                    <p
                      className={`${styles.transactionAmount} ${getAmountClass(transaction.type)}`}
                    >
                      {transaction.type === "WITHDRAWAL" || transaction.type === "withdraw" ? "-" : "+"}{Math.abs(transaction.amount)} جنيه
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MessageDrawer />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        currentBalance={balance || 0}
      />
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </main>
  );
}
