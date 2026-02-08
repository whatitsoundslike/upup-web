import type { Metadata } from 'next';
import TipsList from '@/components/tips/TipsList';
import { fetchTipData } from '@/components/tips/tipData';

export const metadata: Metadata = {
    title: "테슬라 꿀팁 & 가이드 - ZROOM Tesla Tips",
    description: "테슬라 오너들을 위한 유용한 팁과 가이드를 확인하세요. 모델3, 모델Y 관리 및 이용 꿀팁.",
    keywords: "테슬라팁, 테슬라꿀팁, 모델3팁, 모델Y팁, 테슬라가이드, 전기차꿀팁",
    openGraph: {
        title: "테슬라 꿀팁 & 가이드 - ZROOM Tesla Tips",
        description: "테슬라 오너들을 위한 유용한 팁과 가이드를 확인하세요. 모델3, 모델Y 관리 및 이용 꿀팁.",
        url: "https://zroom.io/tesla/tips",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/tips",
    },
};

export default async function Page() {
    const tips = await fetchTipData('tesla');
    return <TipsList tips={tips} theme="tesla" />;
}
