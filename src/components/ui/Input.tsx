import { InputHTMLAttributes, ReactNode } from "react";
import styles from "@/styles/auth/auth.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    startIcon?: ReactNode;
    onIconClick?: () => void;
    startAdornment?: ReactNode;
    wrapperStyle?: React.CSSProperties;
}

export const Input = ({ startIcon, onIconClick, startAdornment, wrapperStyle, className, ...props }: InputProps) => {
    return (
        <div className={styles.inputWrapper} style={wrapperStyle}>
            {startIcon && (
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onIconClick}
                    tabIndex={-1}
                    style={{ cursor: onIconClick ? 'pointer' : 'default' }}
                >
                    {startIcon}
                </button>
            )}
            {startAdornment && (
                <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 2 }}>
                    {startAdornment}
                </div>
            )}
            <input
                className={`${styles.input} ${className || ""}`}
                {...props}
            />
        </div>
    );
};
