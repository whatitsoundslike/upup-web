import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SubsidyTable from './SubsidyTable';

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

// ISR: 1시간마다 재검증
export const revalidate = 3600;

async function getSubsidies() {
    const subsidies = await prisma.subsidy.findMany({
        select: {
            locationName1: true,
            locationName2: true,
            totalCount: true,
            recievedCount: true,
            releaseCount: true,
            remainCount: true,
            etc: true,
        },
    });

    return subsidies;
}

export default async function Page() {
    const subsidies = await getSubsidies();

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SubsidyTable initialData={subsidies} />
            </div>
        </div>
    );
}
