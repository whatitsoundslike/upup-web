import type { Metadata } from 'next';
import Shop from '@/components/Shop';

export const metadata: Metadata = {
    title: "데스크 셋업 필수템 쇼핑 - ZROOM Desk Shop",
    description: "키보드, 모니터, 조명 등 데스크 셋업 필수 아이템 모음.",
    keywords: "데스크용품, 키보드추천, 모니터추천, 데스크조명, 마우스패드",
    openGraph: {
        title: "데스크 셋업 필수템 쇼핑 - ZROOM Desk Shop",
        description: "키보드, 모니터, 조명 등 데스크 셋업 필수 아이템 모음.",
        url: "https://zroom.io/desk/shop",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/desk/shop",
    },
};

export default function DeskShopPage() {
    return <Shop category="desk" />;
}
