'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Newspaper,
    Coins,
    ShoppingBag,
    Users,
    Lightbulb,
    Menu,
    X,
    Moon,
    Sun,
    Handshake
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
    { name: '테슬라뉴스', href: '/news', icon: Newspaper },
    { name: '보조금 현황', href: '/subsidy', icon: Coins },
    { name: '악세사리', href: '/shop', icon: ShoppingBag },
    { name: '중고거래', href: '/used-trade', icon: Handshake },
    { name: '커뮤니티', href: '/community', icon: Users },
];

export function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b dark:border-white/10" style={{ backgroundColor: 'var(--background-hex)' }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative h-12 w-32">
                                <Image
                                    src="/logo.png"
                                    alt="Tesla Logo"
                                    fill
                                    className="object-contain transition-transform group-hover:scale-105"
                                    priority
                                />
                            </div>
                            <span className="sr-only">TESLA EV</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        pathname === item.href
                                            ? "text-tesla-red"
                                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
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
                                    key={item.name}
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
                                    {item.name}
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

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t dark:border-white/10 px-4 py-2" style={{ backgroundColor: 'var(--background-hex)' }}>
            <div className="flex items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            pathname === item.href
                                ? "text-tesla-red"
                                : "text-foreground/60"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
