import Link from "next/link";
import styles from "@/styles/auth/auth.module.css";

interface AuthFooterProps {
    label: string;
    linkText: string;
    href: string;
}

export const AuthFooter = ({ label, linkText, href }: AuthFooterProps) => {
    return (
        <div className={styles.footerLink}>
            {label} <Link href={href}>{linkText}</Link>
        </div>
    );
};
