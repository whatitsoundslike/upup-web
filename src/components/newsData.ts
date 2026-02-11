import type { NewsItem, NewsCategory } from './NewsListClient';

const REVALIDATE_SECONDS = 3600; // 1시간

export async function fetchNewsData(category: NewsCategory): Promise<NewsItem[]> {
    try {
        const res = await fetch(
            `https://raw.githubusercontent.com/whatitsoundslike/upup-admin/refs/heads/main/data/${category}_news.json`,
            { next: { revalidate: REVALIDATE_SECONDS } }
        );

        if (!res.ok) {
            return [];
        }

        const data: NewsItem[] = await res.json();
        // {{title}} 포함된 항목 필터링
        return data.filter(item => !item.title.includes('{{title}}'));
    } catch (error) {
        console.error(`Failed to fetch ${category} news data:`, error);
        return [];
    }
}
