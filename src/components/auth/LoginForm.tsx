"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/auth/auth.module.css";
import loginStyles from "@/styles/auth/login.module.css";
import { EyeIcon, EyeOffIcon, GoogleIcon, AppleIcon } from "@/components/ui/Icons";
import { AuthFooter } from "./AuthFooter";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { signInWithEmailPassword, signInWithGoogle, signInWithApple, getFirebaseIdToken } from "@/lib/auth/socialAuth";
import { SessionManager } from "@/lib/utils/session";

export const LoginForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

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
            // Sign in with Firebase
            const userCredential = await signInWithEmailPassword(
                formData.identifier,
                formData.password
            );

            // Get Firebase ID token
            const idToken = await getFirebaseIdToken(userCredential);

            // Store session data
            const sessionManager = SessionManager.getInstance();
            sessionManager.setToken(idToken);
            sessionManager.setEmail(userCredential.user.email || "");
            sessionManager.setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            });

            // Redirect to attempted page or dashboard
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin");
            router.push(redirectUrl);
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === "auth/user-not-found") {
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

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithGoogle();
            const idToken = await getFirebaseIdToken(userCredential);

            // Store session data
            const sessionManager = SessionManager.getInstance();
            sessionManager.setToken(idToken);
            sessionManager.setEmail(userCredential.user.email || "");
            sessionManager.setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            });

            // Redirect to attempted page or dashboard
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin");
            router.push(redirectUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول عبر جوجل");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithApple();
            const idToken = await getFirebaseIdToken(userCredential);

            // Store session data
            const sessionManager = SessionManager.getInstance();
            sessionManager.setToken(idToken);
            sessionManager.setEmail(userCredential.user.email || "");
            sessionManager.setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
            });

            // Redirect to attempted page or dashboard
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
            sessionStorage.removeItem("redirectAfterLogin");
            router.push(redirectUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول عبر أبل");
        } finally {
            setIsLoading(false);
        }
    };

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
                        placeholder="ادخل البريد الالكتروني هنا"
                        className={styles.input}
                        value={formData.identifier}
                        onChange={(e) => handleInputChange("identifier", e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>كلمة المرور</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="ادخل كلمة المرور"
                            className={styles.input}
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.iconButton}
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
                    <div className={styles.error} style={{ marginBottom: '1rem' }}>
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
