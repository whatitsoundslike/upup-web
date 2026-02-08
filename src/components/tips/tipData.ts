import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface TipItem {
    id: string;
    category: string;
    title: string;
    thumbnail: string | null;
    summary: string | null;
    content: string;
    keyword?: unknown;
}

const CACHE_REVALIDATE = 3600; // 1시간
const isDev = process.env.NODE_ENV === 'development';

// 내부 DB 조회 함수들
async function _fetchTipData(category: string): Promise<TipItem[]> {
    const tips = await prisma.tip.findMany({
        where: { category },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            category: true,
            title: true,
            summary: true,
            content: true,
            thumbnail: true,
            keyword: true,
        },
    });

    return tips.map(tip => ({
        ...tip,
        id: tip.id.toString(),
    }));
}

async function _fetchTipById(id: string): Promise<TipItem | null> {
    try {
        const tip = await prisma.tip.findUnique({
            where: { id: BigInt(id) },
            select: {
                id: true,
                category: true,
                title: true,
                summary: true,
                content: true,
                thumbnail: true,
                keyword: true,
            },
        });

        if (!tip) return null;

        return {
            ...tip,
            id: tip.id.toString(),
        };
    } catch {
        return null;
    }
}

async function _fetchRelatedTips(category: string, currentId: string, limit: number = 2): Promise<TipItem[]> {
    const tips = await prisma.tip.findMany({
        where: {
            category,
            id: { not: BigInt(currentId) },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            category: true,
            title: true,
            summary: true,
            content: true,
            thumbnail: true,
            keyword: true,
        },
    });

    return tips.map(tip => ({
        ...tip,
        id: tip.id.toString(),
    }));
}

// 캐시된 함수들 (프로덕션에서만 캐싱)
const cachedFetchTipData = (category: string) =>
    unstable_cache(
        () => _fetchTipData(category),
        [`tips-list-${category}`],
        { revalidate: CACHE_REVALIDATE }
    )();

const cachedFetchTipById = (id: string) =>
    unstable_cache(
        () => _fetchTipById(id),
        [`tip-${id}`],
        { revalidate: CACHE_REVALIDATE }
    )();

const cachedFetchRelatedTips = (category: string, currentId: string, limit: number = 2) =>
    unstable_cache(
        () => _fetchRelatedTips(category, currentId, limit),
        [`related-tips-${category}-${currentId}-${limit}`],
        { revalidate: CACHE_REVALIDATE }
    )();

// 외부 export 함수들 - 개발모드는 캐시 없이, 프로덕션은 캐시 사용
export async function fetchTipData(category: string): Promise<TipItem[]> {
    return isDev ? _fetchTipData(category) : cachedFetchTipData(category);
}

export async function fetchTipById(id: string): Promise<TipItem | null> {
    return isDev ? _fetchTipById(id) : cachedFetchTipById(id);
}

export async function fetchRelatedTips(category: string, currentId: string, limit: number = 2): Promise<TipItem[]> {
    return isDev ? _fetchRelatedTips(category, currentId, limit) : cachedFetchRelatedTips(category, currentId, limit);
}
