import { LanguageProvider } from './i18n/LanguageContext';

export default function SuperpetLayout({ children }: { children: React.ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>;
}
