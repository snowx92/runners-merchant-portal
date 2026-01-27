"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "@/styles/home/profileDropdown.module.css";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const t = useTranslations('nav');
    const tCommon = useTranslations('common');

    const { user } = useUserProfile();

    const handleLogout = async () => {
        try {
            const auth = getFirebaseAuth();
            await signOut(auth);

            // Clear session
            const sessionManager = SessionManager.getInstance();
            sessionManager.clearAll();

            // Redirect to login
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    const displayName = user?.fullName || user?.storeName || (user?.fistName ? `${user.fistName} ${user.lastName}` : tCommon('user'));
    const displayAvatar = user?.avatar || "/icons/User.svg";

    return (
        <div
            className={styles.profileContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.profileTrigger} onClick={() => router.push('/profile')}>
                <div className={styles.profileImageWrapper}>
                    {user?.avatar ? (
                        <img
                            src={displayAvatar}
                            alt={displayName}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span className={styles.profileName}>{displayName}</span>

            </div>

            {isOpen && (
                <div
                    className={styles.dropdownMenu}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={styles.menuHeader} onClick={() => router.push('/profile')}>
                        <div className={styles.menuProfileImage}>
                            {user?.avatar ? (
                                <img
                                    src={displayAvatar}
                                    alt={displayName}
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className={styles.menuProfileName}>{displayName}</span>
                    </div>

                    <div className={styles.menuDivider}></div>

                    <Link href="/setting" className={styles.menuItem}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.1667 12.5C16.0557 12.7513 16.0227 13.0302 16.0717 13.3006C16.1207 13.571 16.2495 13.8208 16.4417 14.0167L16.4917 14.0667C16.6465 14.2213 16.7694 14.4053 16.8535 14.6078C16.9375 14.8103 16.981 15.0272 16.981 15.2463C16.981 15.4655 16.9375 15.6824 16.8535 15.8849C16.7694 16.0874 16.6465 16.2714 16.4917 16.426C16.3371 16.5808 16.1531 16.7037 15.9506 16.7877C15.7481 16.8718 15.5312 16.9153 15.312 16.9153C15.0929 16.9153 14.876 16.8718 14.6735 16.7877C14.471 16.7037 14.287 16.5808 14.1323 16.426L14.0823 16.376C13.8865 16.1838 13.6366 16.055 13.3662 16.006C13.0959 15.957 12.817 15.99 12.5657 16.101C12.3192 16.2069 12.1109 16.3852 11.9686 16.6131C11.8263 16.841 11.7566 17.1079 11.769 17.3773V17.5C11.769 17.9421 11.5933 18.3659 11.2807 18.6785C10.9681 18.9911 10.5443 19.1667 10.1023 19.1667C9.66028 19.1667 9.23649 18.9911 8.92393 18.6785C8.61137 18.3659 8.43566 17.9421 8.43566 17.5V17.425C8.41735 17.1463 8.33567 16.8763 8.19713 16.6373C8.05859 16.3982 7.86696 16.197 7.63899 16.0497C7.38768 15.9386 7.10877 15.9056 6.83839 15.9546C6.56801 16.0036 6.31816 16.1324 6.12233 16.3247L6.07233 16.3747C5.91767 16.5295 5.73368 16.6524 5.53117 16.7364C5.32866 16.8204 5.11176 16.8639 4.89262 16.8639C4.67348 16.8639 4.45658 16.8204 4.25407 16.7364C4.05156 16.6524 3.86757 16.5295 3.71291 16.3747C3.55813 16.22 3.43524 16.036 3.35119 15.8335C3.26714 15.631 3.22363 15.4141 3.22363 15.195C3.22363 14.9758 3.26714 14.7589 3.35119 14.5564C3.43524 14.3539 3.55813 14.1699 3.71291 14.0153L3.76291 13.9653C3.95517 13.7695 4.08398 13.5196 4.13298 13.2492C4.18198 12.9788 4.14898 12.6999 4.04316 12.4487C3.93728 12.2022 3.75899 11.9939 3.53109 11.8516C3.30319 11.7093 3.03622 11.6396 2.76683 11.652H2.64399C2.20192 11.652 1.77813 11.4763 1.46557 11.1637C1.15301 10.8512 0.977295 10.4274 0.977295 9.98533C0.977295 9.54326 1.15301 9.11947 1.46557 8.80691C1.77813 8.49435 2.20192 8.31864 2.64399 8.31864H2.71899C2.99767 8.30033 3.26768 8.21865 3.50672 8.08011C3.74576 7.94157 3.94695 7.74994 4.09433 7.52197C4.20014 7.27066 4.2331 6.99175 4.18411 6.72137C4.13511 6.45099 4.0063 6.20114 3.81399 6.00531L3.76399 5.95531C3.60921 5.80065 3.48632 5.61666 3.40227 5.41415C3.31822 5.21164 3.27471 4.99474 3.27471 4.7756C3.27471 4.55646 3.31822 4.33956 3.40227 4.13705C3.48632 3.93454 3.60921 3.75055 3.76399 3.59589C3.91865 3.44111 4.10264 3.31822 4.30515 3.23417C4.50766 3.15012 4.72456 3.10661 4.9437 3.10661C5.16284 3.10661 5.37974 3.15012 5.58225 3.23417C5.78476 3.31822 5.96875 3.44111 6.12341 3.59589L6.17341 3.64589C6.36924 3.8382 6.61909 3.96701 6.88947 4.01601C7.15985 4.06501 7.43876 4.03201 7.69008 3.92619H7.76508C8.01159 3.82031 8.21988 3.64202 8.36218 3.41412C8.50449 3.18622 8.57419 2.91925 8.56175 2.64986V2.52702C8.56175 2.08495 8.73746 1.66116 9.05002 1.3486C9.36258 1.03604 9.78637 0.860328 10.2284 0.860328C10.6705 0.860328 11.0943 1.03604 11.4069 1.3486C11.7194 1.66116 11.8952 2.08495 11.8952 2.52702V2.60202C11.9076 2.87141 11.9773 3.13838 12.1196 3.36628C12.2619 3.59418 12.4702 3.77247 12.7167 3.87835C12.968 3.98417 13.2469 4.01717 13.5173 3.96817C13.7877 3.91917 14.0375 3.79036 14.2334 3.59805L14.2834 3.54805C14.438 3.39327 14.622 3.27038 14.8245 3.18633C15.027 3.10228 15.2439 3.05877 15.4631 3.05877C15.6822 3.05877 15.8991 3.10228 16.1016 3.18633C16.3041 3.27038 16.4881 3.39327 16.6427 3.54805C16.7975 3.70271 16.9204 3.88669 17.0044 4.0892C17.0885 4.29171 17.132 4.50861 17.132 4.72775C17.132 4.94689 17.0885 5.16379 17.0044 5.3663C16.9204 5.56881 16.7975 5.7528 16.6427 5.90746L16.5927 5.95746C16.4004 6.15329 16.2716 6.40314 16.2226 6.67352C16.1736 6.9439 16.2066 7.22281 16.3124 7.47413V7.54913C16.4183 7.79564 16.5966 8.00393 16.8245 8.14624C17.0524 8.28854 17.3194 8.35824 17.5888 8.3458H17.7116C18.1537 8.3458 18.5775 8.52151 18.89 8.83407C19.2026 9.14663 19.3783 9.57042 19.3783 10.0125C19.3783 10.4546 19.2026 10.8784 18.89 11.1909C18.5775 11.5035 18.1537 11.6792 17.7116 11.6792H17.6366C17.3672 11.6916 17.1003 11.7613 16.8724 11.9036C16.6445 12.0459 16.4662 12.2542 16.3603 12.5007Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('settings')}
                    </Link>

                    <button onClick={handleLogout} className={styles.menuItem}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
    );
};
