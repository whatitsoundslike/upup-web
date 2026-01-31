import type { Metadata } from 'next';
import Dungeon from './Dungeon';

export const metadata: Metadata = {
    title: '슈퍼펫 던전 탐험 - ZROOM Superpet',
    description: '내 슈퍼펫 캐릭터로 다양한 던전에 도전하고 보상을 획득하세요!',
    keywords: '슈퍼펫던전, 펫배틀, 반려동물RPG, 던전탐험',
    openGraph: {
        title: '슈퍼펫 던전 탐험 - ZROOM Superpet',
        description: '내 슈퍼펫 캐릭터로 다양한 던전에 도전하고 보상을 획득하세요!',
        url: 'https://zroom.io/superpet/dungeon',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/dungeon',
    },
};

export default function DungeonPage() {
    return <Dungeon />;
}
