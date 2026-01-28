"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/home/Navbar";
import { MessageDrawer } from "@/components/home/MessageDrawer";
import { WithdrawModal } from "@/components/transaction/WithdrawModal";
import { DepositModal } from "@/components/transaction/DepositModal";
import { TransactionDetailsModal } from "@/components/transaction/TransactionDetailsModal";
import styles from "@/styles/transaction/transaction.module.css";
import { Cairo } from "next/font/google";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { commonService } from "@/lib/api/services/commonService";
import { Transaction } from "@/lib/api/types/common.types";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

function TransactionContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('wallet');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        commonService.getBalance(),
        commonService.getTransactions(),
      ]);

      if (balanceRes?.data) setBalance(balanceRes.data.balance);
      if (transactionsRes?.data?.items) setTransactions(transactionsRes.data.items);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ref parameter from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && transactions.length > 0) {
      const transaction = transactions.find(t => t.id === ref || t.orignal === ref);
      if (transaction) {
        setSelectedTransaction(transaction);
        setIsDetailsModalOpen(true);
      }
    }
     
  }, [searchParams, transactions]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (date: any) => {
    try {
      if (!date) return "";
      let timestamp: Date;
      if (typeof date === "object" && date._seconds) {
        timestamp = new Date(date._seconds * 1000);
      } else {
        timestamp = new Date(date);
      }
      // Manually format to ensure Western numerals in both English and Arabic modes
      const month = String(timestamp.getMonth() + 1).padStart(2, '0');
      const day = String(timestamp.getDate()).padStart(2, '0');
      const year = timestamp.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return "";
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTransaction(null);
    // Clear the ref parameter from URL
    window.history.replaceState({}, "", "/transaction");
  };



  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "COMMISSION":
        return "/icons/Upload.png";
      case "COD":
        return "/icons/Download.png";
      case "PENALTY":
        return "/icons/product-money.svg";
      default:
        return "/icons/product-money.svg";
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "COMMISSION":
        return t('transactionTypes.commission');
      case "COD":
        return t('transactionTypes.cod');
      case "PENALTY":
        return t('transactionTypes.penalty');
      default:
        return transaction.status || "";
    }
  };

  const getTransactionClass = (type: Transaction["type"]) => {
    switch (type) {
      case "COD":
        return styles.iconWrapperDeposit; // أخضر
      case "COMMISSION":
      case "PENALTY":
        return styles.iconWrapperWithdraw; // أحمر
      default:
        return styles.iconWrapperReceived;
    }
  };

  const getAmountClass = (type: Transaction["type"]) => {
    switch (type) {
      case "COD":
        return styles.amountDeposit; // أخضر
      case "COMMISSION":
      case "PENALTY":
        return styles.amountWithdraw; // أحمر
      default:
        return styles.amountReceived;
    }
  };

  const getAmountSign = (type: Transaction["type"]) => {
    switch (type) {
      case "COD":
        return "+";
      case "COMMISSION":
      case "PENALTY":
        return "-";
      default:
        return "";
    }
  };


  return (
    <main className={`${styles.mainContainer} ${cairo.className}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>

        {/* Balance Card */}
        <div className={styles.balanceCard}>
          <p className={styles.balanceLabel}>{t('currentBalance')}</p>
          <h2 className={styles.balanceAmount}>
            <span className={styles.amount}>{balance !== null ? balance : "..."}</span> {tCommon('currency')}
          </h2>
          <div className={styles.buttonGroup}>
            <button className={styles.withdrawButton} onClick={() => setIsWithdrawModalOpen(true)}>
              {t('withdraw')}
            </button>
            <button className={styles.depositButton} onClick={() => setIsDepositModalOpen(true)}>
              {t('deposit')}
            </button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className={styles.transactionsSection}>
          <h3 className={styles.sectionTitle}>{t('transactions')}</h3>

          <div className={styles.transactionsList}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>{tCommon('loading')}</div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>{t('noTransactions')}</div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={styles.transactionCard}
                  onClick={() => handleTransactionClick(transaction)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.transactionLeft}>
                    <div className={`${styles.iconWrapper} ${getTransactionClass(transaction.type)}`}>
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
                      <p className={styles.transactionTitle}>{getTransactionTitle(transaction)}</p>
                      <p className={styles.transactionDate}>{formatDate(transaction.date)}</p>
                    </div>
                  </div>

                  <div className={styles.transactionCenter}>
<p
  className={`${styles.transactionAmount} ${getAmountClass(transaction.type)}`}
>
  {getAmountSign(transaction.type)}
  {Math.abs(transaction.amount)} {tCommon('currency')}
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
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        transaction={selectedTransaction}
      />
    </main>
  );
}

function TransactionPageFallback() {
  const tCommon = useTranslations('common');
  return (
    <main className={`${styles.mainContainer} ${cairo.className}`}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "50px" }}>{tCommon('loading')}</div>
    </main>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<TransactionPageFallback />}>
      <TransactionContent />
    </Suspense>
  );
}
