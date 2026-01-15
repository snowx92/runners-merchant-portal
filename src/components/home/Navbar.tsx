"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/styles/home/home.module.css";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { SessionManager } from "@/lib/utils/session";

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

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

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                {/* Right Side (Logo + Links) - First (Start) in RTL */}
                <div className={styles.navRight}>
                    <Link href="/">
                        <Image
                            src="/navLogo.png"
                            alt="Runners Logo"
                            width={40}
                            height={40}
                            style={{ objectFit: 'contain' }}
                        />
                    </Link>
                    <div className={styles.navLinks}>
                        <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>
                            <Image
                                src="/icons/Home.svg"
                                alt="Home"
                                width={20}
                                height={20}
                                className={pathname === '/' ? styles.navIconActive : styles.navIconInactive}
                            />
                            الرئيسية
                        </Link>
                        <Link href="/orders" className={`${styles.navLink} ${pathname === '/orders' ? styles.navLinkActive : ''}`}>
                            <Image
                                src="/icons/Box.svg"
                                alt="Orders"
                                width={20}
                                height={20}
                                className={pathname === '/orders' ? styles.navIconActive : styles.navIconInactive}
                            />
                            الطلبات
                        </Link>
                        <Link href="/wallet" className={`${styles.navLink} ${pathname === '/wallet' ? styles.navLinkActive : ''}`}>
                            <Image
                                src="/icons/Wallet.svg"
                                alt="Wallet"
                                width={20}
                                height={20}
                                className={pathname === '/wallet' ? styles.navIconActive : styles.navIconInactive}
                            />
                            المحفظة
                        </Link>
                        <Link href="/profile" className={`${styles.navLink} ${pathname === '/profile' ? styles.navLinkActive : ''}`}>
                            <Image
                                src="/icons/Profile.svg"
                                alt="Profile"
                                width={20}
                                height={20}
                                className={pathname === '/profile' ? styles.navIconActive : styles.navIconInactive}
                            />
                            ملف شخصي
                        </Link>
                    </div>
                </div>

                {/* Left Side (User Actions) */}
                <div className={styles.navLeft}>
                    <div className={styles.navIcon}>
                        <Image src="/icons/Chat.svg" alt="Messages" width={24} height={24} />
                    </div>
                    <div className={styles.navIcon}>
                        <Image src="/icons/Notification.svg" alt="Notifications" width={24} height={24} />
                    </div>
                    <div className={`${styles.navIcon} ${styles.profileIcon}`}>
                        <Image src="/icons/Profile.svg" alt="User" width={24} height={24} />
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                        title="تسجيل الخروج"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};
