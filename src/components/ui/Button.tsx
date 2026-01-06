import { ButtonHTMLAttributes } from "react";
import styles from "@/styles/auth/auth.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "social";
    icon?: React.ReactNode;
}

export const Button = ({ children, variant = "primary", icon, className, ...props }: ButtonProps) => {
    if (variant === "social") {
        return (
            <button className={`${styles.socialBtn} ${className || ""}`} {...props}>
                {icon}
                {children}
            </button>
        );
    }

    return (
        <button className={`${styles.submitButton} ${className || ""}`} {...props}>
            {children}
        </button>
    );
};
