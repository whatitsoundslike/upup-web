import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || 'tesla';

        const tips = await prisma.tip.findMany({
            where: { category },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                category: true,
                title: true,
                summary: true,
                content: true,
                thumbnail: true,
                keyword: true,
            },
        });

        // id를 string으로 변환
        const formattedTips = tips.map(tip => ({
            ...tip,
            id: tip.id.toString(),
        }));

        return NextResponse.json(formattedTips);
    } catch (error) {
        console.error('Tips fetch error:', error);
        return NextResponse.json({ error: '팁을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
