import type { Metadata } from 'next';
import TipsList from '@/components/tips/TipsList';
import { fetchTipData } from '@/components/tips/tipData';

export const metadata: Metadata = {
    title: "육아 꿀팁 & 가이드 - ZROOM Baby Tips",
    description: "육아 꿀팁과 필수 정보를 확인하세요. 신생아부터 유아까지 유용한 가이드.",
    keywords: "육아팁, 육아꿀팁, 신생아팁, 아기팁, 육아가이드",
    openGraph: {
        title: "육아 꿀팁 & 가이드 - ZROOM Baby Tips",
        description: "육아 꿀팁과 필수 정보를 확인하세요. 신생아부터 유아까지 유용한 가이드.",
        url: "https://zroom.io/baby/tips",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/baby/tips",
    },
};

export default async function Page() {
    const tips = await fetchTipData('baby');
    return <TipsList tips={tips} theme="baby" />;
}
