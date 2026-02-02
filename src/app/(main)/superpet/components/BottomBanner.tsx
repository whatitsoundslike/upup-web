'use client';

import { usePathname } from 'next/navigation';
import CoupangBanner from './CoupangBanner';
import { useLanguage } from '@/app/(main)/superpet/i18n/LanguageContext';

export default function BottomBanner() {
    const pathname = usePathname();
    const { t } = useLanguage();

    if (pathname.startsWith('/superpet/dungeon')) return null;

    return (
        <footer className="py-8 bg-foreground/5">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-4 text-blue-500">{t('본 게임은 베타서비스 중입니다.')}</div>
                <div className="text-center mb-4 text-xs text-foreground/40 uppercase tracking-widest font-bold">
                    Sponsored
                </div>
                <CoupangBanner />
            </div>
        </footer>
    );
}
