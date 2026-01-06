import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/home/home.module.css";

export const Navbar = () => {
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
                        <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>
                            الرئيسية
                            <Image src="/icons/Home.svg" alt="Home" width={20} height={20} />
                        </Link>
                        <Link href="/orders" className={styles.navLink}>
                            الطلبات
                            <Image src="/icons/Box.svg" alt="Orders" width={20} height={20} />
                        </Link>
                        <Link href="/wallet" className={styles.navLink}>
                            المحفظة
                            <Image src="/icons/Wallet.svg" alt="Wallet" width={20} height={20} />
                        </Link>
                        <Link href="/profile" className={styles.navLink}>
                            ملف شخصي
                            <Image src="/icons/Profile.svg" alt="Profile" width={20} height={20} />
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
                </div>
            </div>
        </nav>
    );
};
