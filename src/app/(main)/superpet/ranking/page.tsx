import type { Metadata } from 'next';
import RankingClient from './RankingClient';
import { fetchRankingData } from './rankingData';

export const metadata: Metadata = {
    title: '슈퍼펫 랭킹 - ZROOM Superpet',
    description: '슈퍼펫 상위 랭커들의 캐릭터 정보를 확인하세요.',
    keywords: '슈퍼펫랭킹, 펫RPG, 반려동물게임, 랭커',
    openGraph: {
        title: '슈퍼펫 랭킹 - ZROOM Superpet',
        description: '슈퍼펫 상위 랭커들의 캐릭터 정보를 확인하세요.',
        url: 'https://zroom.io/superpet/ranking',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/ranking',
    },
};

export default async function RankingPage() {
    const { data, updatedAt } = await fetchRankingData();
    return <RankingClient rankings={data} updatedAt={updatedAt} />;
}
