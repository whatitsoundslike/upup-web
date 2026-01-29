'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Mail } from 'lucide-react';
import { navConfigs, defaultNavItems, navRoomDescription, navRoomLogo, type NavItem } from '@/config/navConfig';

export function Footer() {
    const pathname = usePathname();
    const firstSegment = pathname.split('/')[1] || '';

    // Hide footer on charger page
    if (pathname === '/tesla/charger') {
        return null;
    }

    const logoSrc: string = navRoomLogo[firstSegment] || '/room-icon/logo.png';
    const navItems: NavItem[] = navConfigs[firstSegment] || defaultNavItems;

    return (
        <footer className="border-t dark:border-white/10 bg-background pt-12 pb-24 md:pb-12 mt-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mt-12 pt-8 border-t dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-foreground/40">
                        © 2026 Zroom. All rights reserved.
                    </p>
                    {/* <div className="flex gap-6">
                        <Link href="/terms" className="text-xs text-foreground/40 hover:text-foreground">이용약관</Link>
                        <Link href="/privacy" className="text-xs text-foreground/40 hover:text-foreground">개인정보처리방침</Link>
                    </div> */}
                </div>
            </div>
        </footer>
    );
}
