'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { koToEn } from './translations';

export type Lang = 'ko' | 'en';

const STORAGE_KEY = 'superpet-lang';

interface LanguageContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (korean: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
    lang: 'ko',
    setLang: () => {},
    t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('ko');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
        if (saved === 'en' || saved === 'ko') {
            setLangState(saved);
        }
    }, []);

    // Navbar에서 localStorage를 직접 변경할 때 동기화
    useEffect(() => {
        const handleStorage = () => {
            const current = localStorage.getItem(STORAGE_KEY) as Lang | null;
            if (current && current !== lang) {
                setLangState(current);
            }
        };

        window.addEventListener('superpet-lang-change', handleStorage);
        return () => window.removeEventListener('superpet-lang-change', handleStorage);
    }, [lang]);

    const setLang = useCallback((newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem(STORAGE_KEY, newLang);
    }, []);

    const t = useCallback((korean: string): string => {
        if (lang === 'ko') return korean;
        return koToEn[korean] ?? korean;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
