import type { Metadata } from 'next';
import NewsListClient from '@/components/NewsListClient';
import { fetchNewsData } from '@/components/newsData';

export const metadata: Metadata = {
    title: "테슬라 최신 뉴스 & 업데이트 - ZROOM Tesla News",
    description: "테슬라의 최신 소식, 업데이트 정보, 그리고 국내외 핫이슈를 한곳에서 확인하세요.",
    keywords: "테슬라뉴스, 전기차소식, 일론머스크, 사이버트럭, 모델3하이랜드, 테슬라업데이트",
    openGraph: {
        title: "테슬라 최신 뉴스 & 업데이트 - ZROOM Tesla News",
        description: "테슬라의 최신 소식, 업데이트 정보, 그리고 국내외 핫이슈를 한곳에서 확인하세요.",
        url: "https://zroom.io/tesla/news",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/news",
    },
};

export default async function Page() {
    const news = await fetchNewsData('tesla');
    return <NewsListClient news={news} category="tesla" />;
}
