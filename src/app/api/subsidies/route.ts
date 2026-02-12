import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 캐시: 4시간 유지, 백그라운드에서 8시간까지 재검증
export const revalidate = 14400; // 4시간

export async function GET() {
    try {
        const subsidies = await prisma.subsidy.findMany({
            select: {
                id: true,
                locationName1: true,
                locationName2: true,
                totalCount: true,
                recievedCount: true,
                releaseCount: true,
                remainCount: true,
                etc: true,
            },
        });

        // id를 string으로 변환
        const formattedSubsidies = subsidies.map(subsidy => ({
            ...subsidy,
            id: subsidy.id.toString(),
        }));

        return NextResponse.json(formattedSubsidies, {
            headers: {
                'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=28800',
            },
        });
    } catch (error) {
        console.error('Subsidies fetch error:', error);
        return NextResponse.json({ error: '보조금 현황을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
