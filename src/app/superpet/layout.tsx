import { LanguageProvider } from './i18n/LanguageContext';
import CoupangBanner from './components/CoupangBanner';
import CoupangLeftBanner from './components/CoupangLeftBanner';
import CoupangRightBanner from './components/CoupangRightBanner';

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

                {/* Global Bottom Banner */}
                <footer className="py-8 bg-foreground/5">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="text-center mb-4 text-xs text-foreground/40 uppercase tracking-widest font-bold">
                            Sponsored
                        </div>
                        <CoupangBanner />
                    </div>
                </footer>
            </div>
        </LanguageProvider>
    );
}
