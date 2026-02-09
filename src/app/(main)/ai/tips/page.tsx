import type { Metadata } from 'next';
import TipsList from '@/components/tips/TipsList';
import { fetchTipData } from '@/components/tips/tipData';

export const metadata: Metadata = {
    title: "AI 활용 꿀팁 & 가이드 - ZROOM AI Tips",
    description: "ChatGPT, Claude, Gemini 등 AI 도구 활용 꿀팁과 프롬프트 엔지니어링 가이드.",
    keywords: "AI팁, 프롬프트팁, ChatGPT활용법, Claude사용법, AI가이드",
    openGraph: {
        title: "AI 활용 꿀팁 & 가이드 - ZROOM AI Tips",
        description: "ChatGPT, Claude, Gemini 등 AI 도구 활용 꿀팁과 프롬프트 엔지니어링 가이드.",
        url: "https://zroom.io/ai/tips",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/ai/tips",
    },
};

export default async function Page() {
    const tips = await fetchTipData('ai');
    return <TipsList tips={tips} theme="ai" />;
}
