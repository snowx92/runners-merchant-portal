"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import styles from "@/styles/transaction/withdrawModal.module.css";
import { commonService } from "@/lib/api/services/commonService";
import { PayoutRequest } from "@/lib/api/types/common.types";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void;
}

export const WithdrawModal = ({ isOpen, onClose, currentBalance, onSuccess }: WithdrawModalProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations('wallet.withdrawModal');
  const tCommon = useTranslations('common');

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("vodafone");
  const [bankCardNumber, setBankCardNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankMethod, setBankMethod] = useState("credit_card"); // default to credit_card if bank_card is selected
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fields when method changes
  useEffect(() => {
    if (!isOpen) return;
    setBankCardNumber("");
    setBankCode("");
    setBankMethod("credit_card");
    setError(null);
  }, [withdrawMethod, isOpen]);

  // Reset fields when bank method changes
  useEffect(() => {
    if (withdrawMethod === 'bank_card') {
      setBankCardNumber("");
    }
  }, [bankMethod]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const luhnCheck = (val: string) => {
    let checksum = 0;
    let j = 1;
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      calc = Number(val.charAt(i)) * j;
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }
      checksum = checksum + calc;
      j = (j === 1) ? 2 : 1;
    }
    return (checksum % 10) === 0;
  };

  const validateForm = () => {
    // Amount validation
    if (!amount) return t('validation.amountRequired');
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return t('validation.amountMustBeNumber');
    if (numAmount <= 0) return t('validation.amountGreaterThanZero');
    if (numAmount > currentBalance) return t('validation.amountExceedsBalance');

    // Account Number validation
    if (!accountNumber) return t('validation.accountRequired');

    const isWallet = ['vodafone', 'etisalat', 'orange', 'aman'].includes(withdrawMethod);
    if (isWallet) {
      if (accountNumber.length !== 11) return t('validation.walletInvalidLength');
      if (!accountNumber.startsWith('01')) return t('validation.walletInvalidPrefix');
    }

    // Bank fields validation
    const isBank = ['bank_wallet', 'bank_card'].includes(withdrawMethod);
    if (isBank) {
      if (!bankCardNumber) return t('validation.bankCardRequired');
      if (!bankCode) return t('validation.bankCodeRequired');

      if (withdrawMethod === 'bank_card') {
        if (!bankMethod) return t('validation.bankMethodRequired');

        if (bankMethod === 'credit_card' || bankMethod === 'prepaid_card') {
          const cleanedCard = bankCardNumber.replace(/\D/g, '');
          if (cleanedCard.length < 13 || cleanedCard.length > 19) return t('validation.cardInvalidLength');
          if (!luhnCheck(cleanedCard)) return t('validation.cardInvalidLuhn');
        } else if (bankMethod === 'cash_transfer') {
          if (bankCardNumber.length !== 29) return t('validation.ibanInvalidLength');
          if (!bankCardNumber.toUpperCase().startsWith('EG')) return t('validation.ibanInvalidPrefix');
          // Basic character check for IBAN
          if (!/^[A-Z0-9]+$/.test(bankCardNumber)) return t('validation.ibanInvalidFormat');
        }
      }
    }

    return null;
  };

  const handleWithdrawClick = () => {
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: PayoutRequest = {
        amount: Number(amount),
        method: withdrawMethod,
        accountNumber: accountNumber,
        bank_card_number: (withdrawMethod === 'bank_wallet' || withdrawMethod === 'bank_card') ? bankCardNumber : "",
        bank_code: (withdrawMethod === 'bank_wallet' || withdrawMethod === 'bank_card') ? bankCode : "",
        bank_method: (withdrawMethod === 'bank_card') ? bankMethod : ""
      };

      await commonService.requestPayout(payload);
      alert(t('success'));
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Withdrawal failed", error);
      setError(error instanceof Error ? error.message : t('failed'));
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      onClose();
    }
  };

  const bankCodesList = [
    "AUB", "MIDB", "BDC", "HSBC", "CAE", "EGB", "UB", "QNB", "ARAB", "ENBD", "ABK", "NBK", "ABC", "FAB", "ADIB", "CIB", "HDB", "MISR", "AAIB", "EALB", "EDBE", "FAIB", "BLOM", "ADCB", "BOA", "SAIB", "NBE", "ABRK", "POST", "NSB", "IDB", "SCB", "MASH", "AIB", "GASC", "ARIB", "PDAC", "NBG", "CBE", "BBE"
  ];

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.modalContent}>
          {showConfirm ? (
            // Confirmation View
            <>
              <h2 className={styles.modalTitle}>{t('confirmTitle')}</h2>
              <div className={styles.confirmDetails}>
                <p><strong>{t('confirmAmount')}:</strong> {amount} {tCommon('currency')}</p>
                <p><strong>{t('confirmMethod')}:</strong> {t(withdrawMethod)}</p>
                <p><strong>{t('confirmAccount')}:</strong> {accountNumber}</p>
                {(withdrawMethod === 'bank_wallet' || withdrawMethod === 'bank_card') && (
                  <>
                    <p><strong>{t('confirmBankCode')}:</strong> {t(`bankCodes.${bankCode}`)}</p>
                    <p style={{ overflowWrap: 'anywhere' }}><strong>{t('confirmBankCard')}:</strong> {bankCardNumber}</p>
                  </>
                )}
                {withdrawMethod === 'bank_card' && (
                  <p><strong>{t('confirmBankMethod')}:</strong> {t(`bankMethods.${bankMethod}`)}</p>
                )}
                <p className={styles.feesText} style={{ marginTop: '1rem', fontWeight: 'bold' }}>{t('confirmFeeNote')}</p>
              </div>
              <div className={styles.buttonGroup}>
                <button className={styles.cancelButton} onClick={handleCancel}>
                  {t('cancelButton')}
                </button>
                <button
                  className={styles.withdrawButton}
                  onClick={handleConfirmWithdraw}
                  disabled={isLoading}
                >
                  {isLoading ? t('processing') : t('confirmButton')}
                </button>
              </div>
            </>
          ) : (
            // Form View
            <>
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
                  <svg className={styles.selectIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Bank Method (Only for bank_card) */}
              {withdrawMethod === 'bank_card' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('bankMethod')}</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={bankMethod}
                      onChange={(e) => setBankMethod(e.target.value)}
                    >
                      <option value="credit_card">{t('bankMethods.creditCard')}</option>
                      <option value="prepaid_card">{t('bankMethods.prepaidCard')}</option>
                      <option value="cash_transfer">{t('bankMethods.cashTransfer')}</option>
                    </select>
                    <svg className={styles.selectIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Bank Code (For bank_wallet and bank_card) */}
              {(withdrawMethod === 'bank_wallet' || withdrawMethod === 'bank_card') && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('bankCode')}</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                    >
                      <option value="">{tCommon('optional')}</option>
                      {bankCodesList.map((code) => (
                        <option key={code} value={code}>
                          {t(`bankCodes.${code}`)}
                        </option>
                      ))}
                    </select>
                    <svg className={styles.selectIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Bank Card Number (For bank_wallet and bank_card) */}
              {(withdrawMethod === 'bank_wallet' || withdrawMethod === 'bank_card') && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('bankCardNumber')}</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={withdrawMethod === 'bank_card' && bankMethod === 'cash_transfer' ? t('bankCardNumberIbanPlaceholder') : t('bankCardNumberCardPlaceholder')}
                    value={bankCardNumber}
                    onChange={(e) => setBankCardNumber(e.target.value)}
                  />
                  <p className={styles.helperText} style={{ marginTop: '4px' }}>
                    {t('bankCardNumberHelper')}
                  </p>
                </div>
              )}


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

              {/* Helper Text for Wallet */}
              <p className={styles.helperText}>
                {['vodafone', 'etisalat', 'orange', 'aman'].includes(withdrawMethod) ? t('accountNumberWalletHelper') : t('accountHelper')}
              </p>

              {/* Error Message */}
              {error && <p className={styles.errorText} style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

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
                  onClick={handleWithdrawClick}
                >
                  {t('submit')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
