'use client';

import useSWR from 'swr';
import SubsidyTable from './SubsidyTable';

interface City {
    locationName1: string;
    locationName2: string;
    totalCount: number;
    recievedCount: number;
    releaseCount: number;
    remainCount: number;
    etc: string | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const loadingSkeleton = (
    <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-tesla-red/20 border-t-tesla-red rounded-full animate-spin" />
            <p className="text-foreground/60 font-medium">데이터를 불러오는 중입니다...</p>
        </div>
    </div>
);

export default function SubsidyClient() {
    const { data: cities, isLoading } = useSWR<City[]>('/api/subsidies', fetcher, {
        revalidateOnFocus: false,      // 탭 포커스 시 재요청 안함
        revalidateOnReconnect: false,  // 네트워크 재연결 시 재요청 안함
        dedupingInterval: 4 * 60 * 60 * 1000, // 4시간 동안 중복 요청 방지
        refreshInterval: 0,            // 자동 갱신 비활성화
    });

    if (isLoading) {
        return loadingSkeleton;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SubsidyTable initialData={cities || []} />
            </div>
        </div>
    );
}
