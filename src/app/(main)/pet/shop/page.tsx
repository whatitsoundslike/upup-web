import type { Metadata } from 'next';
import ShopListClient from '@/components/ShopListClient';
import { fetchShopData } from '@/components/shopData';

export const metadata: Metadata = {
    title: "반려동물 용품 쇼핑 - ZROOM Pet Shop",
    description: "사료, 간식, 장난감 등 반려동물 필수 아이템 모음.",
    keywords: "반려동물용품, 강아지용품, 고양이용품, 펫용품추천, 사료추천",
    openGraph: {
        title: "반려동물 용품 쇼핑 - ZROOM Pet Shop",
        description: "사료, 간식, 장난감 등 반려동물 필수 아이템 모음.",
        url: "https://zroom.io/pet/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/pet/shop",
    },
};

export default async function PetShopPage() {
    const products = await fetchShopData('pet');
    return <ShopListClient products={products} category="pet" />;
}
