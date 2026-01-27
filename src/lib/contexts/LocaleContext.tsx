"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, locales, defaultLocale, localeDirection, localeNames } from '@/i18n/config';

interface LocaleContextType {
  locale: Locale;
  direction: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  localeName: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read locale from cookie on mount
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined;

    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;

    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    setLocaleState(newLocale);

    // Update HTML attributes
    document.documentElement.lang = newLocale;
    document.documentElement.dir = localeDirection[newLocale];

    // Reload to apply new translations
    window.location.reload();
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
  }, [locale, setLocale]);

  // Update HTML attributes on locale change
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = localeDirection[locale];
    }
  }, [locale, mounted]);

  const value: LocaleContextType = {
    locale,
    direction: localeDirection[locale],
    setLocale,
    toggleLocale,
    localeName: localeNames[locale]
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
