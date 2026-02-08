import type { Metadata } from 'next';
import Shop from '@/components/Shop';

export const metadata: Metadata = {
    title: "똑똑한 엄마들의 육아템 쇼핑 - ZROOM Baby Shop",
    description: "인기 육아템부터 가성비 꿀템까지, 우리 아기를 위한 최고의 선택.",
    keywords: "육아용품, 아기옷, 유모차추천, 기저귀추천, 장난감쇼핑",
    openGraph: {
        title: "똑똑한 엄마들의 육아템 쇼핑 - ZROOM Baby Shop",
        description: "인기 육아템부터 가성비 꿀템까지, 우리 아기를 위한 최고의 선택.",
        url: "https://zroom.io/baby/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/baby/shop",
    },
};

export default function BabyShopPage() {
    return <Shop category="baby" />;
}

