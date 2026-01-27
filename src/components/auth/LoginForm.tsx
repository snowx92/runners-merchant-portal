/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "@/styles/auth/auth.module.css";
import loginStyles from "@/styles/auth/login.module.css";
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  AppleIcon,
} from "@/components/ui/Icons";
import { AuthFooter } from "./AuthFooter";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import {
  signInWithEmailPassword,
  signInWithGoogle,
  signInWithApple,
  getFirebaseIdToken,
} from "@/lib/auth/socialAuth";
import { SessionManager } from "@/lib/utils/session";

// 🔥 Firebase
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

const auth = getFirebaseAuth();
const db = getFirebaseDb();


export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  /* -------------------- Helpers -------------------- */

  const clearSessionAndSignOut = async () => {
    try {
      await signOut(auth);
    } catch {}

    const session = SessionManager.getInstance();
    session.setToken("");
    session.setEmail("");
    session.setUser(null as any);
  };

  const assertSupplierUserOrThrow = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw new Error("USER_DOC_NOT_FOUND");
    }

    const data = snap.data() as { type?: string };
    if (data.type !== "SUPPLIER") {
      throw new Error("NOT_SUPPLIER");
    }
  };

  const storeSession = async (userCredential: any) => {
    const idToken = await getFirebaseIdToken(userCredential);
    const session = SessionManager.getInstance();

    session.setToken(idToken);
    session.setEmail(userCredential.user.email || "");
    session.setUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  /* -------------------- Email Login -------------------- */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.identifier.trim()) {
      setError(t('errors.emailRequired'));
      return;
    }

    if (!formData.password) {
      setError(t('errors.passwordRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailPassword(
        formData.identifier,
        formData.password
      );

      // ✅ Check Firestore user type
      await assertSupplierUserOrThrow(userCredential.user.uid);

      // ✅ Store session only if SUPPLIER
      await storeSession(userCredential);

      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectUrl);
    } catch (err: any) {
      console.error(err);

      if (err.message === "NOT_SUPPLIER") {
        await clearSessionAndSignOut();
        setError(t('errors.accountNotAuthorized'));
      } else if (err.message === "USER_DOC_NOT_FOUND") {
        await clearSessionAndSignOut();
        setError(t('errors.userDataIncomplete'));
      } else if (err.code === "auth/user-not-found") {
        setError(t('errors.emailNotRegistered'));
      } else if (err.code === "auth/wrong-password") {
        setError(t('errors.wrongPassword'));
      } else if (err.code === "auth/invalid-email") {
        setError(t('errors.invalidEmail'));
      } else {
        setError(t('errors.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- Google Login -------------------- */

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithGoogle();
      await assertSupplierUserOrThrow(userCredential.user.uid);
      await storeSession(userCredential);

      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectUrl);
    } catch (err: any) {
      await clearSessionAndSignOut();
      setError(t('errors.accountNotAuthorized'));
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- Apple Login -------------------- */

  const handleAppleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithApple();
      await assertSupplierUserOrThrow(userCredential.user.uid);
      await storeSession(userCredential);

      const redirectUrl =
        sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectUrl);
    } catch (err: any) {
      await clearSessionAndSignOut();
      setError(t('errors.accountNotAuthorized'));
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('loginTitle')}</h1>
        <p className={styles.subtitle}>
          {t('loginSubtitle')}
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('email')}</label>
          <input
            type="email"
            className={styles.input}
            placeholder={t('emailPlaceholder')}
            value={formData.identifier}
            onChange={(e) =>
              handleInputChange("identifier", e.target.value)
            }
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('password')}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <Link href="#" className={loginStyles.forgotPassword}>
          {t('forgotPassword')}
        </Link>

        {error && (
          <div className={styles.error} style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "" : t('login')}
        </button>

        <div className={styles.divider}>{tCommon('or')}</div>

        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon />
            {t('apple')}
          </button>

          <button
            type="button"
            className={styles.socialButton}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon />
            {t('google')}
          </button>
        </div>

        <AuthFooter
          label={t('noAccount')}
          linkText={t('register')}
          href="/auth/register"
        />
      </form>

      <LoadingOverlay isLoading={isLoading} />
    </>
  );
};
