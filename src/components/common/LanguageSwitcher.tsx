"use client";

import { useLocale } from '@/lib/contexts/LocaleContext';
import styles from '@/styles/common/languageSwitcher.module.css';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'icon', className = '' }: LanguageSwitcherProps) {
  const { locale, toggleLocale } = useLocale();

  const getLabel = () => {
    switch (variant) {
      case 'icon':
        return locale === 'ar' ? 'EN' : 'ع';
      case 'text':
        return locale === 'ar' ? 'English' : 'العربية';
      case 'full':
        return locale === 'ar' ? '🌐 English' : '🌐 العربية';
      default:
        return locale === 'ar' ? 'EN' : 'ع';
    }
  };

  return (
    <button
      onClick={toggleLocale}
      className={`${styles.languageSwitcher} ${styles[variant]} ${className}`}
      title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {getLabel()}
    </button>
  );
}
