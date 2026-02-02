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
    LogIn,
    LogOut,
    LogInIcon,
    MoreVertical,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { navConfigs, defaultNavItems, type NavItem, navRoomLogo } from '@/config/navConfig';
import { Globe, Megaphone } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [lang, setLang] = React.useState<'ko' | 'en'>('ko');
    const { user, loading: authLoading, logout } = useAuth();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('superpet-lang');
        if (saved === 'en') setLang('en');
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const logoSrc: string = navRoomLogo[firstSegment] || '/room-icon/tesla.png';

    return (
        <nav className="sticky top-0 z-50 w-full border-b dark:border-white/10 mdmax-w-[500px] mx-auto" style={{ backgroundColor: 'var(--background-hex)' }}>
            <div className="md:mx-auto sm:px-6 lg:px-8">
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
                        {/* Announcement - always visible */}
                        {mounted && isSuperpet && (
                            <button
                                onClick={showAnnouncement}
                                className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                aria-label="Show announcement"
                            >
                                <Megaphone className="h-4 w-4" />
                            </button>
                        )}

                        {/* Desktop: inline buttons */}
                        {mounted && isSuperpet && (
                            <button
                                onClick={toggleLang}
                                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-foreground/5 transition-colors text-sm font-semibold"
                                aria-label="Toggle language"
                            >
                                <Globe className="h-4 w-4" />
                                <span>{lang === 'ko' ? 'EN' : 'KO'}</span>
                            </button>
                        )}
                        {mounted && !authLoading && (
                            user ? (
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-sm text-foreground/70">
                                        {user.name || user.email}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                        aria-label="로그아웃"
                                    >
                                        <div className="flex items-center">로그아웃<LogOut className="h-4 w-4" /></div>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                                    className="hidden md:block p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                    aria-label="로그인"
                                >
                                    <div className="flex items-center">로그인<LogIn className="h-4 w-4" /></div>
                                </Link>
                            )
                        )}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="hidden md:block p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}

                        {/* Mobile: dropdown menu */}
                        {mounted && (
                            <div className="relative md:hidden" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                    aria-label="메뉴"
                                >
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 rounded-lg border dark:border-white/10 shadow-lg py-1 z-50"
                                            style={{ backgroundColor: 'var(--background-hex)' }}
                                        >
                                            {isSuperpet && (
                                                <button
                                                    onClick={() => { toggleLang(); setMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    <span>{lang === 'ko' ? 'English' : '한국어'}</span>
                                                </button>
                                            )}
                                            {!authLoading && (
                                                user ? (
                                                    <button
                                                        onClick={() => { logout(); setMenuOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>로그아웃</span>
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                                                        onClick={() => setMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                                                    >
                                                        <LogIn className="h-4 w-4" />
                                                        <span>로그인</span>
                                                    </Link>
                                                )
                                            )}
                                            <button
                                                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/5 transition-colors"
                                            >
                                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                                <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
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
