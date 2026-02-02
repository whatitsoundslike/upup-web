import type { Metadata } from 'next';
import TeslaChargerMap from './TeslaChargerMap';

export const metadata: Metadata = {
    title: "테슬라 슈퍼차저 위치 - ZROOM Tesla",
    description: "내 주변 테슬라 슈퍼차저 위치를 확인하고 가장 가까운 충전소를 찾아보세요.",
    keywords: "테슬라, 슈퍼차저, 충전소, 테슬라충전, 전기차충전",
    openGraph: {
        title: "테슬라 슈퍼차저 위치 - ZROOM Tesla",
        description: "내 주변 테슬라 슈퍼차저 위치를 확인하고 가장 가까운 충전소를 찾아보세요.",
        url: "https://zroom.io/tesla/charger",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/charger",
    },
};

export default function ChargerPage() {
    return <TeslaChargerMap />;
}
