"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/auth/auth.module.css";
import loginStyles from "@/styles/auth/login.module.css";
import { Input, Button } from "@/components/ui";
import { EyeIcon, EyeOffIcon, GoogleIcon, AppleIcon } from "@/components/ui/Icons";
import { AuthFooter } from "./AuthFooter";

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>تسجيل الدخول</h1>
                <p className={styles.subtitle}>
                    قم بإدخال بياناتك للوصول إلى حسابك والتمتع بجميع خدمات التطبيق بسهولة
                </p>
            </div>

            <form action="#" onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>البريد الالكتروني</label>
                    <Input
                        type="text"
                        placeholder="ادخل الايميل او رقم الهاتف هنا"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>كلمة المرور</label>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="ادخل كلمة المرور"
                        startIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        onIconClick={() => setShowPassword(!showPassword)}
                    />
                </div>

                <Link href="#" className={loginStyles.forgotPassword}>
                    نسيت كلمة المرور
                </Link>

                <Button type="submit">
                    تسجيل الدخول
                </Button>

                <div className={styles.divider}>أو</div>

                <div className={styles.socialButtons}>
                    <Button type="button" variant="social" icon={<AppleIcon />}>
                        ابل
                    </Button>
                    <Button type="button" variant="social" icon={<GoogleIcon />}>
                        جوجل
                    </Button>
                </div>

                <AuthFooter
                    label="ليس لديك حساب؟"
                    linkText="إنشاء حساب"
                    href="/auth/register"
                />
            </form>
        </>
    );
};
