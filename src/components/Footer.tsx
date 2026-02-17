'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Mail } from 'lucide-react';
import { navConfigs, defaultNavItems, navRoomDescription, navRoomLogo, type NavItem } from '@/config/navConfig';

export function Footer() {
    const pathname = usePathname();
    const firstSegment = pathname.split('/')[1] || '';

    // Hide footer on room pages
    if (pathname.includes('/room')) {
        return null;
    }

    const logoSrc: string = navRoomLogo[firstSegment];
    const navItems: NavItem[] = navConfigs[firstSegment] || defaultNavItems;

    return (
        <footer className="dark:border-white/10 bg-background pt-2 pb-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Z Room
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
