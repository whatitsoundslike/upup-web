import type { Metadata } from 'next';
import NewsListClient from '@/components/NewsListClient';
import { fetchNewsData } from '@/components/newsData';

export const metadata: Metadata = {
    title: "반려동물 최신 뉴스 & 트렌드 - ZROOM Pet News",
    description: "반려동물, 펫 케어에 관한 최신 소식과 트렌드를 확인하세요.",
    keywords: "반려동물뉴스, 펫뉴스, 강아지뉴스, 고양이뉴스, 펫케어",
    openGraph: {
        title: "반려동물 최신 뉴스 & 트렌드 - ZROOM Pet News",
        description: "반려동물, 펫 케어에 관한 최신 소식과 트렌드를 확인하세요.",
        url: "https://zroom.io/pet/news",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/pet/news",
    },
};

export default async function Page() {
    const news = await fetchNewsData('pet');
    return <NewsListClient news={news} category="pet" />;
}
