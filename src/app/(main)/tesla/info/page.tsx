import type { Metadata } from 'next';
import TeslaInfoTabs from './TeslaInfoTabs';

export const metadata: Metadata = {
    title: "테슬라 슈퍼차저 & 보조금 현황 - ZROOM Tesla",
    description: "테슬라 슈퍼차저 위치와 전기차 보조금 실시간 현황을 한 곳에서 확인하세요.",
    keywords: "테슬라, 슈퍼차저, 충전소, 전기차보조금, 보조금현황, 지자체보조금",
    openGraph: {
        title: "테슬라 슈퍼차저 & 보조금 현황 - ZROOM Tesla",
        description: "테슬라 슈퍼차저 위치와 전기차 보조금 실시간 현황을 한 곳에서 확인하세요.",
        url: "https://zroom.io/tesla/info",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/info",
    },
};

export default function TeslaInfoPage() {
    return <TeslaInfoTabs />;
}
