import type { Metadata } from 'next';
import TipsList from '@/components/tips/TipsList';
import { fetchTipData } from '@/components/tips/tipData';

export const metadata: Metadata = {
    title: "데스크 셋업 꿀팁 & 가이드 - ZROOM Desk Tips",
    description: "생산성을 높이는 데스크 셋업 꿀팁과 인테리어 가이드를 공유합니다.",
    keywords: "데스크팁, 데스크셋업팁, 작업환경, 생산성팁, 홈오피스가이드",
    openGraph: {
        title: "데스크 셋업 꿀팁 & 가이드 - ZROOM Desk Tips",
        description: "생산성을 높이는 데스크 셋업 꿀팁과 인테리어 가이드를 공유합니다.",
        url: "https://zroom.io/desk/tips",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/desk/tips",
    },
};

export default async function Page() {
    const tips = await fetchTipData('desk');
    return <TipsList tips={tips} theme="desk" />;
}
