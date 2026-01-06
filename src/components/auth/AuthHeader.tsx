import Image from "next/image";
import styles from "@/styles/auth/auth.module.css";

export const AuthHeader = () => {
    return (
        <div className={styles.logoSide} dir="rtl">
            <Image
                src="/Logo.png"
                alt="Runners Logo"
                width={250}
                height={100}
                className={styles.logoImage}
                priority
            />
            <p className={styles.logoTagline}>
                هنا يمكننا وضع وصف للتطبيق او سلوجان
            </p>
        </div>
    );
};
