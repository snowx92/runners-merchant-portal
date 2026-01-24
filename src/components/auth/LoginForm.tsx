/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      setError("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    if (!formData.password) {
      setError("الرجاء إدخال كلمة المرور");
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
        setError("هذا الحساب غير مصرح له بالدخول");
      } else if (err.message === "USER_DOC_NOT_FOUND") {
        await clearSessionAndSignOut();
        setError("بيانات المستخدم غير مكتملة");
      } else if (err.code === "auth/user-not-found") {
        setError("البريد الإلكتروني غير مسجل");
      } else if (err.code === "auth/wrong-password") {
        setError("كلمة المرور غير صحيحة");
      } else if (err.code === "auth/invalid-email") {
        setError("البريد الإلكتروني غير صالح");
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول");
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
      setError("هذا الحساب غير مصرح له بالدخول");
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
      setError("هذا الحساب غير مصرح له بالدخول");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>تسجيل الدخول</h1>
        <p className={styles.subtitle}>
          قم بإدخال بياناتك للوصول إلى حسابك والتمتع بجميع خدمات التطبيق بسهولة
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label className={styles.label}>البريد الالكتروني</label>
          <input
            type="email"
            className={styles.input}
            placeholder="ادخل البريد الالكتروني هنا"
            value={formData.identifier}
            onChange={(e) =>
              handleInputChange("identifier", e.target.value)
            }
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>كلمة المرور</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="ادخل كلمة المرور"
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
          نسيت كلمة المرور
        </Link>

        {error && (
          <div className={styles.error} style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <div className={styles.divider}>أو</div>

        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={handleAppleLogin}
            disabled={isLoading}
          >
            <AppleIcon />
            ابل
          </button>

          <button
            type="button"
            className={styles.socialButton}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon />
            جوجل
          </button>
        </div>

        <AuthFooter
          label="ليس لديك حساب؟"
          linkText="إنشاء حساب"
          href="/auth/register"
        />
      </form>

      <LoadingOverlay isLoading={isLoading} />
    </>
  );
};
