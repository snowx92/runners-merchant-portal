"use client";

import Image from "next/image";
import styles from "@/styles/common/loadingOverlay.module.css";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay = ({ isLoading }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.iconWrapper}>
        <Image
          src="/loading-icon.png"
          alt="Loading"
          width={80}
          height={80}
          className={styles.loadingIcon}
          priority
        />
      </div>
    </div>
  );
};
