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
        <footer className="dark:border-white/10 bg-background pt-12 pb-24 md:pb-12">
            
        </footer>
    );
}
