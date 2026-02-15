import type { Metadata } from 'next';
import { fetchLatestNews } from '@/components/newsData';
import CategoryHome from '@/components/CategoryHome';

export const metadata: Metadata = {
    title: "반려동물 정보 & 커뮤니티 - ZROOM Pet",
    description: "반려동물 돌봄, 건강, 훈련 정보와 펫 케어 커뮤니티. 반려인들의 소통 공간.",
    keywords: "반려동물, 펫케어, 강아지, 고양이, 반려동물용품, 펫커뮤니티",
    openGraph: {
        title: "반려동물 정보 & 커뮤니티 - ZROOM Pet",
        description: "반려동물 돌봄, 건강, 훈련 정보와 펫 케어 커뮤니티. 반려인들의 소통 공간.",
        url: "https://zroom.io/pet",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/pet",
    },
};

export default async function Page() {
    const newsData = await fetchLatestNews('pet', 3);

    return <CategoryHome category="pet" newsData={newsData} />;
}
