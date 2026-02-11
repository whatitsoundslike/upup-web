import {
    Newspaper,
    Coins,
    ShoppingBag,
    ShoppingCart,
    Users,
    Handshake,
    Home,
    Gamepad2,
    Star,
    BookOpen,
    Baby,
    type LucideIcon,
    Zap,
    CircleDollarSign,
    Warehouse,
    Swords,
    PawPrint,
    Briefcase,
    Sparkles,
    LampDesk,
    Lightbulb,
} from 'lucide-react';

export interface NavItem {
    name: string;
    nameEn?: string;
    href: string;
    icon: LucideIcon;
}

export interface NavConfig {
    [key: string]: NavItem[];
}

export const navConfigs: NavConfig = {
    tesla: [
        { name: '뉴스', href: '/tesla/news', icon: Newspaper },
        { name: '팁', href: '/tesla/tips', icon: Lightbulb },
        { name: '슈퍼차저', href: '/tesla/charger', icon: Zap },
        { name: '보조금 현황', href: '/tesla/subsidy', icon: CircleDollarSign },
        { name: 'Shop', href: '/tesla/shop', icon: ShoppingBag },
        { name: 'Room', href: '/tesla/room', icon: Warehouse },
    ],
    baby: [
        { name: '뉴스', href: '/baby/news', icon: Newspaper },
        { name: '육아정보', href: '/baby/tips', icon: Lightbulb },
        { name: 'Shop', href: '/baby/shop', icon: ShoppingBag },
        { name: 'Room', href: '/baby/room', icon: Warehouse },
    ],
    superpet: [
        { name: '홈', nameEn: 'Home', href: '/superpet', icon: Home },
        { name: '던전', nameEn: 'Dungeon', href: '/superpet/dungeon', icon: Swords },
        { name: '랭킹', nameEn: 'Ranking', href: '/superpet/ranking', icon: Star },
        { name: '상점', nameEn: 'Shop', href: '/superpet/shop', icon: ShoppingCart },
        { name: '인벤토리', nameEn: 'Inventory', href: '/superpet/room', icon: Warehouse },
    ],
    ai: [
        { name: '뉴스', href: '/ai/news', icon: Newspaper },
        { name: '팁', href: '/ai/tips', icon: Lightbulb },
        { name: 'Shop', href: '/ai/shop', icon: ShoppingBag },
        { name: 'Room', href: '/ai/room', icon: Warehouse },
    ],
    desk: [
        { name: '뉴스', href: '/desk/news', icon: Newspaper },
        { name: '팁', href: '/desk/tips', icon: Lightbulb },
        { name: 'Shop', href: '/desk/shop', icon: ShoppingBag },
        { name: 'Room', href: '/desk/room', icon: Warehouse },
    ],
};

// 기본 네비게이션 (루트 경로일 때)
export const defaultNavItems: NavItem[] = [
    { name: 'Tesla', href: '/tesla', icon: Home },
    { name: 'Baby', href: '/baby', icon: Baby },
    { name: 'Superpet', href: '/superpet', icon: PawPrint },
    { name: 'AI', href: '/ai', icon: Sparkles },
    { name: 'Desk', href: '/desk', icon: LampDesk },
];

export const navRoomLogo: Record<string, string> = {
    tesla: '/room-icon/tesla.webp',
    baby: '/room-icon/baby.webp',
    superpet: '/room-icon/superpet_icon.webp',
    ai: '/room-icon/ai.webp',
    desk: '/room-icon/desk.webp',
}

export const navRoomDescription: Record<string, string> = {
    tesla: '테슬라 관련 정보 및 커뮤니티',
    baby: '육아 정보 및 커뮤니티',
    superpet: '반려동물 RPG 게임 및 커뮤니티',
    ai: 'AI 팁 및 커뮤니티',
    desk: '데스크테리어 커뮤니티',
}
