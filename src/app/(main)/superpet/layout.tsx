import { Metadata, Viewport } from 'next';
import { LanguageProvider } from './i18n/LanguageContext';
import CoupangLeftBanner from './components/CoupangLeftBanner';
import CoupangRightBanner from './components/CoupangRightBanner';
import BottomBanner from './components/BottomBanner';
import FeedReward from './components/FeedReward';
import PWAInstallPrompt from './components/PWAInstallPrompt';

export const metadata: Metadata = {
    title: 'Super Pet - 우리집 멍냥이와 함께하는 RPG 모험',
    description: '우리집 멍냥이와 함께 던전을 탐험하고 장비를 수집하는 RPG 게임!',
    manifest: '/superpet-manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Super Pet',
    },
};

export const viewport: Viewport = {
    themeColor: '#6366f1',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

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

                <FeedReward />
                <PWAInstallPrompt />

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
