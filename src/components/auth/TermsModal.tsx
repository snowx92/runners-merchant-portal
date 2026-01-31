"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import styles from "@/styles/transaction/withdrawModal.module.css"; // Reusing modal styles for consistency
import { commonService } from "@/lib/api/services/commonService";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
    const locale = useLocale();
    const isRTL = locale === "ar";
    const t = useTranslations('settings'); // Using settings translations for title
    const tCommon = useTranslations('common');

    const [content, setContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchTerms = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Pass true to skip authentication
                    const response = await commonService.getTerms(true);
                    setContent(response.data);
                } catch (err) {
                    console.error("Failed to fetch terms", err);
                    setError(tCommon('error'));
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTerms();
        }
    }, [isOpen, tCommon]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modal} dir={isRTL ? "rtl" : "ltr"} style={{ maxWidth: '800px' }}>
                <div className={styles.modalContent}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className={styles.modalTitle} style={{ margin: 0 }}>{t('termsPage.title')}</h2>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto', lineHeight: '1.6' }}>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>{tCommon('loading')}</div>
                        ) : error ? (
                            <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>{error}</div>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        )}
                    </div>

                    {/* Footer */}
                    <div className={styles.buttonGroup} style={{ marginTop: '1.5rem' }}>
                        <button className={styles.primaryButton} onClick={onClose} style={{ width: '100%' }}>
                            {tCommon('close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
