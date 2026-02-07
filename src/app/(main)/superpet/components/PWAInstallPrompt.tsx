'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import { getItem, setItem } from '../storage';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const { t, lang } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    useEffect(() => {
        // 이미 설치된 앱인지 확인
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        // 오늘 이미 닫았는지 확인
        const dismissedDate = getItem('pwa-prompt-dismissed');
        const today = new Date().toISOString().slice(0, 10);
        if (dismissedDate === today) return;

        // iOS 감지
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(isIOSDevice);

        // 모바일에서만 표시
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) return;

        if (isIOSDevice) {
            // iOS는 beforeinstallprompt 이벤트가 없으므로 바로 표시
            setTimeout(() => setShowPrompt(true), 3000);
        } else {
            // Android/Chrome
            const handler = (e: Event) => {
                e.preventDefault();
                setDeferredPrompt(e as BeforeInstallPromptEvent);
                setTimeout(() => setShowPrompt(true), 3000);
            };

            window.addEventListener('beforeinstallprompt', handler);
            return () => window.removeEventListener('beforeinstallprompt', handler);
        }
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowIOSGuide(false);
        const today = new Date().toISOString().slice(0, 10);
        setItem('pwa-prompt-dismissed', today);
    };

    return (
        <>
            {/* 설치 유도 배너 */}
            <AnimatePresence>
                {showPrompt && !showIOSGuide && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-2xl border border-white/20">
                            <button
                                onClick={handleDismiss}
                                className="absolute top-2 right-2 p-1 text-white/60 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Download className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-sm">
                                        {t('앱으로 설치하기')}
                                    </h3>
                                    <p className="text-white/70 text-xs">
                                        {lang === 'ko'
                                            ? '홈 화면에 추가하고 더 빠르게 즐기세요!'
                                            : 'Add to home screen for quick access!'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleInstall}
                                    className="px-4 py-2 bg-white text-indigo-600 font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
                                >
                                    {t('설치')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS 설치 가이드 모달 */}
            <AnimatePresence>
                {showIOSGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4"
                        onClick={handleDismiss}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-indigo-500"
                        >
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-3">📲</div>
                                <h3 className="text-lg font-black mb-2">
                                    {lang === 'ko' ? 'iOS 설치 방법' : 'How to Install on iOS'}
                                </h3>
                            </div>
                            <ol className="text-sm text-foreground/70 space-y-3 mb-4">
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                                    <span>{lang === 'ko' ? '하단의 공유 버튼을 탭하세요' : 'Tap the Share button below'} <span className="text-lg">⬆️</span></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                                    <span>{lang === 'ko' ? '"홈 화면에 추가"를 선택하세요' : 'Select "Add to Home Screen"'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                                    <span>{lang === 'ko' ? '"추가"를 탭하세요' : 'Tap "Add"'}</span>
                                </li>
                            </ol>
                            <button
                                onClick={handleDismiss}
                                className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
