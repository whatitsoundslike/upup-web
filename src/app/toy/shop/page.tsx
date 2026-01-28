import type { Metadata } from 'next';
import Shop from '@/components/Shop';

export const metadata: Metadata = {
    title: "컬렉터들의 위시리스트 - ZROOM Toy Shop",
    description: "품절 대란템부터 유니크한 피규어까지, 토이 마니아들을 위한 쇼핑 채널.",
    keywords: "장난감할인, 피규어직구, 한정판토이, 레고할인, 건담샵",
    openGraph: {
        title: "컬렉터들의 위시리스트 - ZROOM Toy Shop",
        description: "품절 대란템부터 유니크한 피규어까지, 토이 마니아들을 위한 쇼핑 채널.",
        url: "https://zroom.io/toy/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/toy/shop",
    },
};

export default function ToyShopPage() {
    return <Shop category="toy" />;
}
