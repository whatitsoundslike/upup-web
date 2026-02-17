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
        </footer>
    );
}
