import type { Metadata } from 'next';
import TipsList from '@/components/tips/TipsList';
import { fetchTipData } from '@/components/tips/tipData';

export const metadata: Metadata = {
    title: "반려동물 꿀팁 & 가이드 - ZROOM Pet Tips",
    description: "반려동물 건강, 훈련, 돌봄 꿀팁과 가이드를 공유합니다.",
    keywords: "반려동물팁, 강아지훈련, 고양이돌봄, 펫케어팁, 반려동물건강",
    openGraph: {
        title: "반려동물 꿀팁 & 가이드 - ZROOM Pet Tips",
        description: "반려동물 건강, 훈련, 돌봄 꿀팁과 가이드를 공유합니다.",
        url: "https://zroom.io/pet/tips",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/pet/tips",
    },
};

export default async function Page() {
    const tips = await fetchTipData('pet');
    return <TipsList tips={tips} theme="pet" />;
}
