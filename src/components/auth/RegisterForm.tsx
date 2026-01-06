"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/auth/auth.module.css";
import registerStyles from "@/styles/auth/register.module.css";
import { Input, Button } from "@/components/ui";
import { EyeIcon, EyeOffIcon, EgyptFlag } from "@/components/ui/Icons";
import { AuthFooter } from "./AuthFooter";

export const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const PhonePrefix = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 600, direction: 'ltr' }}>+20</span>
            <EgyptFlag />
            <span style={{ fontSize: '0.6rem', color: '#999' }}>▼</span>
        </div>
    );

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>انشاء حساب التاجر</h1>
                <p className={styles.subtitle}>
                    قم بإنشاء حسابك ك تاجر لإضافة منتجاتك وإدارتها بكل سهولة، وتنسيق عملية التوصيل لعملائك
                </p>
            </div>

            <form action="#" onSubmit={(e) => e.preventDefault()}>
                <div className={registerStyles.row}>
                    <div className={registerStyles.col}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>الاسم الاول</label>
                            <Input type="text" placeholder="ادخل الاسم الاول هنا" />
                        </div>
                    </div>
                    <div className={registerStyles.col}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>الاسم الاخير</label>
                            <Input type="text" placeholder="ادخل الاسم الاخير هنا" />
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>اسم المتجر</label>
                    <Input type="text" placeholder="ادخل اسم المتجر هنا" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>البريد الالكتروني</label>
                    <Input type="email" placeholder="ادخل البريد الالكتروني هنا" />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>رقم الهاتف</label>
                    <Input
                        type="tel"
                        placeholder="أدخل رقم الهاتف"
                        startAdornment={PhonePrefix}
                        style={{ paddingLeft: '90px' }}
                        dir="rtl" // Inner input direction? Or wrapper? Wrapper is LTR in Register specifics...
                    // Re-check registerStyles.phoneInputWrapper usage
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

                <div className={styles.formGroup}>
                    <label className={styles.label}>تأكيد كلمة المرور</label>
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="ادخل كلمة المرور"
                        startIcon={showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </div>

                <div className={registerStyles.checkboxWrapper}>
                    <input type="checkbox" id="terms" className={registerStyles.checkbox} />
                    <label htmlFor="terms" className={registerStyles.checkboxLabel}>
                        بالنقر هنا فإنك توافق على الشروط والأحكام
                    </label>
                </div>

                <Button type="submit">
                    التالي
                </Button>

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
