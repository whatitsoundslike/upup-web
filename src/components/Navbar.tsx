'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Menu,
    X,
    Moon,
    Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { navConfigs, defaultNavItems, type NavItem, navRoomLogo } from '@/config/navConfig';
import { Globe, Megaphone } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [lang, setLang] = React.useState<'ko' | 'en'>('ko');

    React.useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('superpet-lang');
        if (saved === 'en') setLang('en');
    }, []);

    // 현재 경로에서 1-depth 추출 (예: /tesla/news -> 'tesla')
    const firstSegment = pathname.split('/')[1] || '';

    // 해당 섹션의 네비게이션 아이템 가져오기
    const navItems: NavItem[] = navConfigs[firstSegment] || defaultNavItems;

    const isSuperpet = firstSegment === 'superpet';

    const toggleLang = () => {
        const next = lang === 'ko' ? 'en' : 'ko';
        setLang(next);
        localStorage.setItem('superpet-lang', next);
        window.dispatchEvent(new Event('superpet-lang-change'));
    };

    const showAnnouncement = () => {
        window.dispatchEvent(new Event('superpet-show-announcement'));
    };

    const getNavName = (item: NavItem) => {
        if (isSuperpet && lang === 'en' && item.nameEn) return item.nameEn;
        return item.name;
    };

    const logoSrc: string = navRoomLogo[firstSegment] || '/room-icon/logo.png';

    return (
        <nav className="sticky top-0 z-50 w-full border-b dark:border-white/10" style={{ backgroundColor: 'var(--background-hex)' }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href={firstSegment ? `/${firstSegment}` : '/'} className="flex items-center gap-2 group">
                            <div className="relative h-12 w-32">
                                <Image
                                    src={logoSrc}
                                    alt="Logo"
                                    fill
                                    className="object-contain transition-transform group-hover:scale-105"
                                    priority
                                />
                            </div>
                            <span className="sr-only">{firstSegment ? firstSegment.toUpperCase() : 'HOME'}</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "text-tesla-red"
                                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                                    )}
                                >
                                    {getNavName(item)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {mounted && isSuperpet && (
                            <>
                                <button
                                    onClick={showAnnouncement}
                                    className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                    aria-label="Show announcement"
                                >
                                    <Megaphone className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={toggleLang}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-foreground/5 transition-colors text-sm font-semibold"
                                    aria-label="Toggle language"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>{lang === 'ko' ? 'EN' : 'KO'}</span>
                                </button>
                            </>
                        )}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t dark:border-white/10 overflow-hidden"
                    >
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium",
                                        pathname === item.href
                                            ? "text-tesla-red bg-tesla-red/10"
                                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {getNavName(item)}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}


export function MobileBottomNav() {
    const pathname = usePathname();
    const [lang, setLang] = React.useState<'ko' | 'en'>('ko');

    React.useEffect(() => {
        const saved = localStorage.getItem('superpet-lang');
        if (saved === 'en') setLang('en');

        const handleChange = () => {
            const current = localStorage.getItem('superpet-lang');
            setLang(current === 'en' ? 'en' : 'ko');
        };
        window.addEventListener('superpet-lang-change', handleChange);
        return () => window.removeEventListener('superpet-lang-change', handleChange);
    }, []);

    // 현재 경로에서 1-depth 추출
    const firstSegment = pathname.split('/')[1] || '';
    const navItems: NavItem[] = navConfigs[firstSegment] || defaultNavItems;
    const isSuperpet = firstSegment === 'superpet';

    const getNavName = (item: NavItem) => {
        if (isSuperpet && lang === 'en' && item.nameEn) return item.nameEn;
        return item.name;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t dark:border-white/10 px-4 py-2" style={{ backgroundColor: 'var(--background-hex)' }}>
            <div className="flex items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            pathname === item.href
                                ? "text-tesla-red"
                                : "text-foreground/60"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{getNavName(item)}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
