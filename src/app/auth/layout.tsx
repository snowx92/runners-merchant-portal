import { Cairo } from "next/font/google";
import styles from "@/styles/auth/auth.module.css";
import { AuthHeader } from "@/components/auth";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

import { getLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const isRTL = locale === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  return (
    <div className={`${cairo.className} ${styles.authContainer}`}>
      <div className={styles.splitLayout}>
        <AuthHeader />
        <div className={styles.card} dir={direction}>
          {children}
        </div>
      </div>
    </div>
  );
}
