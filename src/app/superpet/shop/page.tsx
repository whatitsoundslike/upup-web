import type { Metadata } from 'next';
import Shop from './Shop';

export const metadata: Metadata = {
    title: '슈퍼펫 상점 - ZROOM Superpet',
    description: '골드와 젬으로 아이템을 구매하세요!',
    keywords: '슈퍼펫상점, 아이템구매, 골드상점, 젬상점',
    openGraph: {
        title: '슈퍼펫 상점 - ZROOM Superpet',
        description: '골드와 젬으로 아이템을 구매하세요!',
        url: 'https://zroom.io/superpet/shop',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/shop',
    },
};

export default function ShopPage() {
    return <Shop />;
}
