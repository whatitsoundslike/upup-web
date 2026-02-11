import type { Metadata } from 'next';
import NewsListClient from '@/components/NewsListClient';
import { fetchNewsData } from '@/components/newsData';

export const metadata: Metadata = {
    title: "육아 최신 뉴스 & 정보 - ZROOM Baby News",
    description: "육아에 관한 최신 소식, 팁, 그리고 정보를 한곳에서 확인하세요.",
    keywords: "육아뉴스, 육아정보, 아기, 임신, 출산, 육아팁",
    openGraph: {
        title: "육아 최신 뉴스 & 정보 - ZROOM Baby News",
        description: "육아에 관한 최신 소식, 팁, 그리고 정보를 한곳에서 확인하세요.",
        url: "https://zroom.io/baby/news",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/baby/news",
    },
};

export default async function Page() {
    const news = await fetchNewsData('baby');
    return <NewsListClient news={news} category="baby" />;
}
