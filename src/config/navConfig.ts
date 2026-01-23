import {
    Newspaper,
    Coins,
    ShoppingBag,
    Users,
    Handshake,
    Home,
    Gamepad2,
    Star,
    BookOpen,
    type LucideIcon
} from 'lucide-react';

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export interface NavConfig {
    [key: string]: NavItem[];
}

export const navConfigs: NavConfig = {
    tesla: [
        { name: '뉴스', href: '/tesla/news', icon: Newspaper },
        { name: '보조금 현황', href: '/tesla/subsidy', icon: Coins },
        { name: 'Shop', href: '/tesla/shop', icon: ShoppingBag },
        { name: 'Room', href: '/tesla/room', icon: Handshake },
    ],
    toy: [
        { name: '홈', href: '/toy', icon: Home },
        { name: 'Shop', href: '/toy/shop', icon: ShoppingBag },
        { name: 'Room', href: '/toy/room', icon: BookOpen },
    ],
};

// 기본 네비게이션 (루트 경로일 때)
export const defaultNavItems: NavItem[] = [
    { name: 'Tesla', href: '/tesla', icon: Home },
    { name: 'Toy', href: '/toy', icon: Gamepad2 },
];

export const navRoomLogo: Record<string, string> = {
    tesla: '/room-icon/tesla.png',
    toy: '/room-icon/toy.png',
}

export const navRoomDescription: Record<string, string> = {
    tesla: '테슬라 관련 정보 및 커뮤니티',
    toy: '장난감 관련 정보 및 커뮤니티',
}
