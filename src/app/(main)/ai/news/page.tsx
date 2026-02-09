import type { Metadata } from 'next';
import AINews from './AINews';

export const metadata: Metadata = {
    title: "AI 최신 뉴스 & 트렌드 - ZROOM AI News",
    description: "인공지능에 관한 최신 소식, 기술 트렌드, 그리고 업계 정보를 한곳에서 확인하세요.",
    keywords: "AI뉴스, 인공지능뉴스, ChatGPT, Claude, Gemini, AI트렌드, 기술뉴스",
    openGraph: {
        title: "AI 최신 뉴스 & 트렌드 - ZROOM AI News",
        description: "인공지능에 관한 최신 소식, 기술 트렌드, 그리고 업계 정보를 한곳에서 확인하세요.",
        url: "https://zroom.io/ai/news",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/ai/news",
    },
};

export default function Page() {
    return <AINews />;
}
