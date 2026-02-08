import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const memberId = BigInt(session.sub);
        const gameSessionId = randomUUID();

        // 새 세션 ID 생성 및 저장 (기존 세션 덮어씀)
        await prisma.gameSave.upsert({
            where: { memberId },
            create: {
                memberId,
                data: {},
                gameSessionId,
            },
            update: {
                gameSessionId,
            },
        });

        return NextResponse.json({ gameSessionId });
    } catch (error) {
        console.error('Session create error:', error);
        return NextResponse.json({ error: '세션 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
