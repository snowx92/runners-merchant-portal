import { Cairo } from "next/font/google";
import styles from "@/styles/auth/auth.module.css";
import { AuthHeader } from "@/components/auth";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${cairo.className} ${styles.authContainer}`}>
      <div className={styles.splitLayout}>
        <AuthHeader />
        <div className={`${styles.card} ${styles.contentRTL}`} dir="rtl">
          {children}
        </div>
      </div>
    </div>
  );
}
