import type { Metadata } from 'next';
import { fetchLatestNews } from '@/components/newsData';
import CategoryHome from '@/components/CategoryHome';

export const metadata: Metadata = {
    title: "AI 트렌드 & 정보 공유 - ZROOM AI",
    description: "AI 기술의 최신 트렌드와 실용적인 활용법을 공유하는 공간. ChatGPT, Claude, Gemini 등 AI 도구 활용 팁을 함께해요.",
    keywords: "AI, 인공지능, ChatGPT, Claude, Gemini, AI도구, AI활용법, 프롬프트엔지니어링",
    openGraph: {
        title: "AI 트렌드 & 정보 공유 - ZROOM AI",
        description: "AI 기술의 최신 트렌드와 실용적인 활용법을 공유하는 공간. ChatGPT, Claude, Gemini 등 AI 도구 활용 팁을 함께해요.",
        url: "https://zroom.io/ai",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/ai",
    },
};

export default async function Page() {
    const newsData = await fetchLatestNews('ai', 3);

    return <CategoryHome category="ai" newsData={newsData} />;
}
