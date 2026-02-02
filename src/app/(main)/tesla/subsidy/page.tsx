import type { Metadata } from 'next';
import TeslaSubsidy from './TeslaSubsidy';

export const metadata: Metadata = {
    title: "2026 전기차 보조금 실시간 현황 - ZROOM Tesla",
    description: "내 지역의 전기차 보조금은 얼마나 남았을까? 지자체별 실시간 접수 및 잔여 정보를 확인하세요.",
    keywords: "전기차보조금, 테슬라보조금, 보조금현황, 지자체보조금, 국고보조금, EV보조금",
    openGraph: {
        title: "2026 전기차 보조금 실시간 현황 - ZROOM Tesla",
        description: "내 지역의 전기차 보조금은 얼마나 남았을까? 지자체별 실시간 접수 및 잔여 정보를 확인하세요.",
        url: "https://zroom.io/tesla/subsidy",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/tesla/subsidy",
    },
};

export default function Page() {
    return <TeslaSubsidy />;
}
