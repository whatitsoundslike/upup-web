import type { Metadata } from 'next';
import DeskNews from './DeskNews';

export const metadata: Metadata = {
    title: "데스크 셋업 최신 뉴스 & 트렌드 - ZROOM Desk News",
    description: "데스크 셋업, 가젯, 인테리어에 관한 최신 소식과 트렌드를 확인하세요.",
    keywords: "데스크뉴스, 데스크셋업, 가젯뉴스, 인테리어트렌드, 홈오피스",
    openGraph: {
        title: "데스크 셋업 최신 뉴스 & 트렌드 - ZROOM Desk News",
        description: "데스크 셋업, 가젯, 인테리어에 관한 최신 소식과 트렌드를 확인하세요.",
        url: "https://zroom.io/desk/news",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/desk/news",
    },
};

export default function Page() {
    return <DeskNews />;
}
