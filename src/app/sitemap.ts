import type { MetadataRoute } from 'next';
import { fetchTipData } from '@/components/tips/tipData';

const BASE_URL = 'https://zroom.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/tesla`, priority: 1.0, changeFrequency: 'daily' },
        { url: `${BASE_URL}/tesla/subsidy`, priority: 0.9, changeFrequency: 'daily' },
        { url: `${BASE_URL}/tesla/shop`, priority: 0.8, changeFrequency: 'daily' },
        { url: `${BASE_URL}/tesla/charger`, priority: 0.8, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/tesla/news`, priority: 0.8, changeFrequency: 'daily' },
        { url: `${BASE_URL}/tesla/tips`, priority: 0.8, changeFrequency: 'weekly' },

        { url: `${BASE_URL}/superpet`, priority: 0.9, changeFrequency: 'daily' },
        { url: `${BASE_URL}/superpet/dungeon`, priority: 0.8, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/superpet/ranking`, priority: 0.8, changeFrequency: 'daily' },
        { url: `${BASE_URL}/superpet/room`, priority: 0.7, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/superpet/shop`, priority: 0.9, changeFrequency: 'weekly' },

        { url: `${BASE_URL}/baby`, priority: 0.7, changeFrequency: 'daily' },
        { url: `${BASE_URL}/baby/tips`, priority: 0.8, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/baby/shop`, priority: 0.9, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/baby/news`, priority: 0.8, changeFrequency: 'daily' },

    ];

    // 팁 상세페이지 동적 생성
    let tipRoutes: MetadataRoute.Sitemap = [];
    try {
        const teslaTips = await fetchTipData('tesla');
        const babyTips = await fetchTipData('baby');

        tipRoutes = [
            ...teslaTips.map((tip) => ({
                url: `${BASE_URL}/tesla/tips/${tip.id}`,
                priority: 0.7,
                changeFrequency: 'monthly' as const,
            })),
            ...babyTips.map((tip) => ({
                url: `${BASE_URL}/baby/tips/${tip.id}`,
                priority: 0.7,
                changeFrequency: 'monthly' as const,
            })),
        ];
    } catch {
        // fetch 실패 시 정적 라우트만 반환
    }

    return [...staticRoutes, ...tipRoutes];
}
