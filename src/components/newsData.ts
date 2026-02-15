import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface NewsItem {
    source: string;
    title: string;
    link: string;
    thumbnail: string | null;
    description: string | null;
    published_at: string | null;
}

export type NewsCategory = 'tesla' | 'baby' | 'ai' | 'desk' | 'pet';

const CACHE_REVALIDATE = 3600; // 1시간
const isDev = process.env.NODE_ENV === 'development';

async function _fetchNewsData(category: NewsCategory): Promise<NewsItem[]> {
    const news = await prisma.news.findMany({
        where: { category },
        orderBy: { publishedAt: 'desc' },
        select: {
            source: true,
            title: true,
            link: true,
            thumbnail: true,
            description: true,
            publishedAt: true,
        },
    });

    return news.map(item => ({
        source: item.source,
        title: item.title,
        link: item.link,
        thumbnail: item.thumbnail,
        description: item.description,
        published_at: item.publishedAt?.toISOString() || null,
    }));
}

async function _fetchLatestNews(category: NewsCategory, limit: number = 3): Promise<NewsItem[]> {
    const news = await prisma.news.findMany({
        where: { category },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: {
            source: true,
            title: true,
            link: true,
            thumbnail: true,
            description: true,
            publishedAt: true,
        },
    });

    return news.map(item => ({
        source: item.source,
        title: item.title,
        link: item.link,
        thumbnail: item.thumbnail,
        description: item.description,
        published_at: item.publishedAt?.toISOString() || null,
    }));
}

// 캐시된 함수들 (프로덕션에서만 캐싱)
const cachedFetchNewsData = (category: NewsCategory) =>
    unstable_cache(
        () => _fetchNewsData(category),
        [`news-list-${category}`],
        { revalidate: CACHE_REVALIDATE }
    )();

const cachedFetchLatestNews = (category: NewsCategory, limit: number) =>
    unstable_cache(
        () => _fetchLatestNews(category, limit),
        [`news-latest-${category}-${limit}`],
        { revalidate: CACHE_REVALIDATE }
    )();

// 외부 export 함수들
export async function fetchNewsData(category: NewsCategory): Promise<NewsItem[]> {
    return isDev ? _fetchNewsData(category) : cachedFetchNewsData(category);
}

export async function fetchLatestNews(category: NewsCategory, limit: number = 3): Promise<NewsItem[]> {
    return isDev ? _fetchLatestNews(category, limit) : cachedFetchLatestNews(category, limit);
}
