"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/auth.module.css";
import registerStyles from "@/styles/auth/register.module.css";
import { EyeIcon, EyeOffIcon, GoogleIcon, AppleIcon } from "@/components/ui/Icons";
import { AuthFooter } from "./AuthFooter";
import { OTPVerification } from "./OTPVerification";
import { otpService } from "@/lib/api/services/otpService";
import { authService } from "@/lib/api/auth/authService";
import {
    createAccountWithEmailPassword,
    signInWithGoogle,
    signInWithApple,
    getFirebaseIdToken
} from "@/lib/auth/socialAuth";
import { SessionManager } from "@/lib/utils/session";

type SignupStep = "form" | "otp" | "completed" | "social-form";

interface FormData {
    firstName: string;
    lastName: string;
    storeName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
}

const validatePhone = (phone: string): boolean => {
    return /^\d{11}$/.test(phone) && phone.startsWith('0');
};

export const RegisterForm = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<SignupStep>("form");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState<string>("");


    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        storeName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptedTerms: false,
    });

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const validateForm = (isSocialAuth: boolean = false): boolean => {
        if (!isSocialAuth) {
            if (!formData.firstName.trim()) {
                setError("الرجاء إدخال الاسم الأول");
                return false;
            }
            if (!formData.lastName.trim()) {
                setError("الرجاء إدخال الاسم الأخير");
                return false;
            }
        }
        if (!formData.storeName.trim()) {
            setError("الرجاء إدخال اسم المتجر");
            return false;
        }
        if (!isSocialAuth) {
            if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError("الرجاء إدخال بريد إلكتروني صحيح");
                return false;
            }
        }
        if (!validatePhone(formData.phone)) {
            setError("رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 0");
            return false;
        }
        if (!isSocialAuth) {
            if (!formData.password || formData.password.length < 6) {
                setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("كلمة المرور غير متطابقة");
                return false;
            }
            if (!formData.acceptedTerms) {
                setError("يجب الموافقة على الشروط والأحكام");
                return false;
            }
        }
        return true;
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Check if user came from Google or Apple signup
        const googleCredential = sessionStorage.getItem("googleUserCredential");
        const appleCredential = sessionStorage.getItem("appleUserCredential");
        const isSocialAuth = !!(googleCredential || appleCredential);

        if (!validateForm(isSocialAuth)) return;

        setIsLoading(true);

        try {
            // Both flows need OTP verification for phone
            console.log("📨 Sending OTP to phone...");
            const phoneToSend = formData.phone;
            const response = await otpService.sendOTP({
                identifier: phoneToSend,
                identifierType: "PHONE",
                reason: "SIGNUP",
            });

            console.log("✅ OTP sent successfully:", response);

            if (response.status === 200 && response.data) {
                // API returns the code directly as a string, not as { code: string }
                const codeValue = typeof response.data === 'string' ? response.data : response.data.code;
                console.log("💾 Setting otpCode to:", codeValue);
                setOtpCode(codeValue);
                setCurrentStep("otp");
            } else {
                throw new Error(response.message || "فشل في إرسال رمز التحقق");
            }
        } catch (err: any) {
            console.error("❌ Signup error:", err);

            if (err.code === "auth/weak-password") {
                setError("كلمة المرور ضعيفة جداً");
            } else if (err.code === "auth/invalid-email") {
                setError("البريد الإلكتروني غير صالح");
            } else {
                setError(err.message || "حدث خطأ أثناء التسجيل");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        setError(null);
        setIsLoading(true);

        try {
            console.log("🔍 Verifying OTP...");
            console.log("📤 Sending verify request with code:", otpCode, "and otp:", otp);
            const response = await otpService.verifyOTP({
                code: otpCode,
                otp,
            });

            console.log("✅ OTP verification response:", response);

            if (response.status === 200 && response.data) {
                // Store the secret code from OTP verification
                // API may return the secretCode directly as a string or as { secretCode: string }
                const secret = typeof response.data === 'string' ? response.data : response.data.secretCode;
                console.log("🔑 Got secret code from OTP verification:", secret);

                // Check if this is a social auth signup
                const googleCredential = sessionStorage.getItem("googleUserCredential");
                const appleCredential = sessionStorage.getItem("appleUserCredential");
                const isSocialAuth = !!(googleCredential || appleCredential);

                if (isSocialAuth) {
                    // Social auth flow - Firebase account already exists
                    console.log("📝 Completing social auth signup...");
                    const credentialData = JSON.parse(googleCredential || appleCredential || "{}");

                    // Create backend account with secretCode + idToken
                    await createAccount(secret, credentialData.uid, true, credentialData.idToken);

                    // Clean up session storage
                    sessionStorage.removeItem("googleUserCredential");
                    sessionStorage.removeItem("appleUserCredential");
                } else {
                    // Regular email/password signup - create Firebase account
                    console.log("🔐 Creating Firebase account...");
                    const userCredential = await createAccountWithEmailPassword(
                        formData.email,
                        formData.password,
                        formData.firstName,
                        formData.lastName
                    );
                    console.log("✅ Firebase account created:", userCredential.user.uid);

                    // Get Firebase ID token
                    const idToken = await getFirebaseIdToken(userCredential);
                    console.log("🎫 Got Firebase ID token");

                    // Store session
                    const sessionManager = SessionManager.getInstance();
                    sessionManager.setToken(idToken);
                    sessionManager.setEmail(formData.email);
                    console.log("💾 Stored session");

                    // Now create backend account with Firebase token + secret code
                    await createAccount(secret, userCredential.user.uid);
                }
            } else {
                setError(response.message || "رمز التحقق غير صحيح");
            }
        } catch (err: any) {
            console.error("❌ OTP verification error:", err);
            if (err.code === "auth/email-already-in-use") {
                setError("البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك");
            } else {
                setError(err.message || "رمز التحقق غير صحيح");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const createAccount = async (secret: string, uid: string, isSocialAuth: boolean = false, idToken?: string) => {
        setIsLoading(true);

        try {
            console.log("📝 Creating backend account...");

            const requestData: any = {
                email: formData.email,
                phone: formData.phone,
                firstName: formData.firstName,
                lastName: formData.lastName,
                storeName: formData.storeName,
                type: "SUPPLIER",
                uid: uid,
                secretCode: secret, // Always include secretCode from OTP verification
            };

            if (isSocialAuth) {
                // For social auth, also include idToken
                requestData.idToken = idToken;
                console.log("🔐 Using social auth (Firebase ID token + secretCode)...");
            } else {
                // For email/password auth, include password
                requestData.password = formData.password;
                console.log("🔐 Using email/password auth with OTP secret...");
            }

            // Call backend API to complete profile
            const response = await authService.signup(requestData);

            console.log("✅ Backend signup response:", response);

            if (response.status === 200 && response.data) {
                console.log("🎉 Account created successfully!");

                // Store session for social auth users
                if (isSocialAuth) {
                    const sessionManager = SessionManager.getInstance();
                    sessionManager.setToken(idToken || "");
                    sessionManager.setEmail(formData.email);
                    sessionManager.setUser({
                        uid: uid,
                        email: formData.email,
                        displayName: `${formData.firstName} ${formData.lastName}`,
                    });
                }

                setCurrentStep("completed");
                // Redirect to dashboard
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                setError(response.message || "فشل في إكمال التسجيل");
            }
        } catch (err: any) {
            console.error("❌ Backend registration error:", err);
            setError(err.message || "حدث خطأ أثناء إكمال التسجيل");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError(null);

        try {
            const response = await otpService.resendOTP({
                code: otpCode,
            });

            if (response.status === 200 && response.data) {
                // API returns the code directly as a string, not as { code: string }
                const codeValue = typeof response.data === 'string' ? response.data : response.data.code;
                setOtpCode(codeValue);
            } else {
                setError(response.message || "فشل في إعادة إرسال رمز التحقق");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء إعادة إرسال رمز التحقق");
        }
    };

    const handleBackToForm = () => {
        setCurrentStep("form");
        setOtpCode("");
        setError(null);
    };

    const handleGoogleSignup = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithGoogle();
            const idToken = await getFirebaseIdToken(userCredential);

            // Pre-fill form with Google data
            const displayName = userCredential.user.displayName || "";
            const nameParts = displayName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            setFormData((prev) => ({
                ...prev,
                firstName: firstName,
                lastName: lastName,
                email: userCredential.user.email || "",
                storeName: "", // User must fill this
                phone: "", // User must fill this
                password: idToken, // Store the Firebase token as password for social auth
                confirmPassword: idToken,
            }));

            // Save the user credential for later use
            sessionStorage.setItem("googleUserCredential", JSON.stringify({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                idToken: idToken,
            }));

            // Show simplified form to collect store name and phone
            setCurrentStep("social-form");
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل عبر جوجل");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleSignup = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithApple();
            const idToken = await getFirebaseIdToken(userCredential);

            // Pre-fill form with Apple data
            const displayName = userCredential.user.displayName || "";
            const nameParts = displayName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            setFormData((prev) => ({
                ...prev,
                firstName: firstName,
                lastName: lastName,
                email: userCredential.user.email || "",
                storeName: "", // User must fill this
                phone: "", // User must fill this
                password: idToken, // Store the Firebase token as password for social auth
                confirmPassword: idToken,
            }));

            // Save the user credential for later use
            sessionStorage.setItem("appleUserCredential", JSON.stringify({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                idToken: idToken,
            }));

            // Show simplified form to collect store name and phone
            setCurrentStep("social-form");
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل عبر أبل");
        } finally {
            setIsLoading(false);
        }
    };

    // Show OTP verification step
    if (currentStep === "otp") {
        return (
            <OTPVerification
                phoneNumber={formData.phone}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToForm}
                isLoading={isLoading}
                error={error}
            />
        );
    }

    // Show success message
    if (currentStep === "completed") {
        return (
            <div className={styles.header} style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h1 className={styles.title}>تم إنشاء الحساب بنجاح!</h1>
                <p className={styles.subtitle}>
                    جاري تحويلك إلى لوحة التحكم...
                </p>
            </div>
        );
    }

    // Show simplified form for social auth users (Google/Apple)
    if (currentStep === "social-form") {
        return (
            <>
                <div className={styles.header}>
                    <h1 className={styles.title}>أكمل بيانات حسابك</h1>
                    <p className={styles.subtitle}>
                        الرجاء إدخال اسم المتجر ورقم الهاتف لإكمال التسجيل
                    </p>
                </div>

                <form onSubmit={handleSubmitForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>الاسم</label>
                        <input
                            type="text"
                            placeholder="الاسم"
                            className={styles.input}
                            value={`${formData.firstName} ${formData.lastName}`.trim() || ""}
                            disabled={true}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>البريد الإلكتروني</label>
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            className={styles.input}
                            value={formData.email}
                            disabled={true}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>اسم المتجر *</label>
                        <input
                            type="text"
                            placeholder="ادخل اسم المتجر هنا"
                            className={styles.input}
                            value={formData.storeName}
                            onChange={(e) => handleInputChange("storeName", e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>رقم الهاتف *</label>
                        <input
                            type="tel"
                            placeholder="أدخل رقم الهاتف (01xxxxxxxxx)"
                            className={styles.input}
                            dir="ltr"
                            value={formData.phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val.length <= 11) handleInputChange("phone", val);
                            }}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.error} style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "جاري التحميل..." : "إنشاء الحساب"}
                    </button>
                </form>
            </>
        );
    }

    // Show registration form
    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>انشاء حساب التاجر</h1>
                <p className={styles.subtitle}>
                    قم بإنشاء حسابك ك تاجر لإضافة منتجاتك وإدارتها بكل سهولة، وتنسيق عملية التوصيل لعملائك
                </p>
            </div>

            <form onSubmit={handleSubmitForm}>
                <div className={registerStyles.row}>
                    <div className={registerStyles.col}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>الاسم الاول</label>
                            <input
                                type="text"
                                placeholder="ادخل الاسم الاول هنا"
                                className={styles.input}
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className={registerStyles.col}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>الاسم الاخير</label>
                            <input
                                type="text"
                                placeholder="ادخل الاسم الاخير هنا"
                                className={styles.input}
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>اسم المتجر</label>
                    <input
                        type="text"
                        placeholder="ادخل اسم المتجر هنا"
                        className={styles.input}
                        value={formData.storeName}
                        onChange={(e) => handleInputChange("storeName", e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>البريد الالكتروني</label>
                    <input
                        type="email"
                        placeholder="ادخل البريد الالكتروني هنا"
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>رقم الهاتف</label>
                    <input
                        type="tel"
                        placeholder="أدخل رقم الهاتف (01xxxxxxxxx)"
                        className={styles.input}
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 11) handleInputChange("phone", val);
                        }}
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
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>تأكيد كلمة المرور</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="ادخل كلمة المرور"
                            className={styles.input}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={styles.iconButton}
                        >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                <div className={registerStyles.checkboxWrapper}>
                    <input
                        type="checkbox"
                        id="terms"
                        className={registerStyles.checkbox}
                        checked={formData.acceptedTerms}
                        onChange={(e) => handleInputChange("acceptedTerms", e.target.checked)}
                        disabled={isLoading}
                    />
                    <label htmlFor="terms" className={registerStyles.checkboxLabel}>
                        بالنقر هنا فإنك توافق على الشروط والأحكام
                    </label>
                </div>

                {error && (
                    <div className={styles.error} style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? "جاري الإرسال..." : "التالي"}
                </button>

                <div className={styles.divider}>أو</div>

                <div className={styles.socialButtons}>
                    <button
                        type="button"
                        className={styles.socialButton}
                        onClick={handleAppleSignup}
                        disabled={isLoading}
                    >
                        <AppleIcon />
                        ابل
                    </button>
                    <button
                        type="button"
                        className={styles.socialButton}
                        onClick={handleGoogleSignup}
                        disabled={isLoading}
                    >
                        <GoogleIcon />
                        جوجل
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <AuthFooter
                        label="لدي حساب بالفعل؟"
                        linkText="تسجيل الدخول"
                        href="/auth/login"
                    />
                </div>
            </form>
        </>
    );
};
