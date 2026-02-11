import type { Metadata } from 'next';
import ShopListClient from '@/components/ShopListClient';
import { fetchShopData } from '@/components/shopData';

export const metadata: Metadata = {
    title: "테슬라 라이프스타일 굿즈 - ZROOM Tesla Shop",
    description: "테슬라 마니아들을 위한 필수 아이템과 유니크한 굿즈들을 만나보세요.",
    keywords: "테슬라굿즈, 테슬라악세사리, 모델3용품, 모델Y용품, 테슬라쇼핑몰",
    openGraph: {
        title: "테슬라 라이프스타일 굿즈 - ZROOM Tesla Shop",
        description: "테슬라 마니아들을 위한 필수 아이템과 유니크한 굿즈들을 만나보세요.",
        url: "https://zroom.io/tesla/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/shop",
    },
};

export default async function TeslaShopPage() {
    const products = await fetchShopData('tesla');
    return <ShopListClient products={products} category="tesla" />;
}
