import type { Metadata } from 'next';
import Craft from './Craft';

export const metadata: Metadata = {
    title: '아이템 제작 - ZROOM Superpet',
    description: '재료를 모아 다양한 아이템을 제작하세요!',
    keywords: '아이템제작, 크래프팅, 주문서제작, 슈퍼펫',
    openGraph: {
        title: '아이템 제작 - ZROOM Superpet',
        description: '재료를 모아 다양한 아이템을 제작하세요!',
        url: 'https://zroom.io/superpet/craft',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/craft',
    },
};

export default function CraftPage() {
    return <Craft />;
}
