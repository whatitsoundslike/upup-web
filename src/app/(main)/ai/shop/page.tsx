import type { Metadata } from 'next';
import Shop from '@/components/Shop';

export const metadata: Metadata = {
    title: "AI 도구 & 서비스 쇼핑 - ZROOM AI Shop",
    description: "AI 구독권, API 크레딧, 생산성 도구까지 AI 관련 서비스 모음.",
    keywords: "AI서비스, ChatGPT구독, Claude구독, AI도구, API크레딧",
    openGraph: {
        title: "AI 도구 & 서비스 쇼핑 - ZROOM AI Shop",
        description: "AI 구독권, API 크레딧, 생산성 도구까지 AI 관련 서비스 모음.",
        url: "https://zroom.io/ai/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/ai/shop",
    },
};

export default function AIShopPage() {
    return <Shop category="ai" />;
}
