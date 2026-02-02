import { LanguageProvider } from './i18n/LanguageContext';
import CoupangLeftBanner from './components/CoupangLeftBanner';
import CoupangRightBanner from './components/CoupangRightBanner';
import BottomBanner from './components/BottomBanner';

export default function SuperpetLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <div className="relative min-h-screen flex flex-col">
                {/* PC Side Banners */}
                <div className="hidden xl:block">
                    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-10">
                        <CoupangLeftBanner className="w-30" />
                    </div>
                    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10">
                        <CoupangRightBanner className="w-30" />
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-grow">
                    {children}
                </main>

                {/* Global Bottom Banner (던전 제외) */}
                <BottomBanner />
            </div>
        </LanguageProvider>
    );
}
