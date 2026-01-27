"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "@/styles/auth/auth.module.css";
import otpStyles from "@/styles/auth/otp.module.css";

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const OTPVerification = ({
  phoneNumber,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  error = null,
}: OTPVerificationProps) => {
  const t = useTranslations('otp');
  const tCommon = useTranslations('common');
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only allow 6-digit numbers
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtp(digits);

    // Focus last input
    inputRefs.current[5]?.focus();

    // Auto-submit
    handleVerify(pastedData);
  };

  const handleVerify = async (otpValue: string) => {
    await onVerify(otpValue);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    await onResend();
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>
          {t('subtitle', { phoneNumber })}
        </p>
      </div>

      <div className={otpStyles.otpContainer}>
        <div className={otpStyles.otpInputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={otpStyles.otpInput}
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className={styles.error} style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        <div className={otpStyles.resendContainer}>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className={otpStyles.resendButton}
              disabled={isLoading}
            >
              {t('resend')}
            </button>
          ) : (
            <p className={otpStyles.timerText}>
              {t('resendIn', { seconds: resendTimer })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleVerify(otp.join(""))}
          className={styles.button}
          disabled={isLoading || otp.some((digit) => !digit)}
        >
          {isLoading ? t('verifying') : t('verify')}
        </button>

        <button
          type="button"
          onClick={onBack}
          className={`${styles.button} ${otpStyles.backButton}`}
          disabled={isLoading}
        >
          {tCommon('back')}
        </button>
      </div>
    </>
  );
};
