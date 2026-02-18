import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function getKSTDayRange() {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    const startOfDay = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate());
    const startOfDayUTC = new Date(startOfDay.getTime() - kstOffset);
    const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);
    return { startOfDayUTC, endOfDayUTC };
}

// GET: 오늘 완료한 미션 키 목록
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const memberId = BigInt(session.sub);
        const { startOfDayUTC, endOfDayUTC } = getKSTDayRange();

        const todayLogs = await prisma.missionLog.findMany({
            where: {
                memberId,
                claimedAt: { gte: startOfDayUTC, lt: endOfDayUTC },
            },
            select: { missionKey: true },
        });

        return NextResponse.json({
            claimed: todayLogs.map(l => l.missionKey),
        });
    } catch (error) {
        console.error('Mission GET error:', error);
        return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
    }
}

// POST: 미션 보상 수령
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { missionKey } = await request.json();

        const validMissions: Record<string, string> = {
            attendance: 'feed:10',
            boss_kill: 'gold:8000',
            normal_kill: 'gold:5000',
        };

        if (!validMissions[missionKey]) {
            return NextResponse.json({ error: '유효하지 않은 미션입니다.' }, { status: 400 });
        }

        const memberId = BigInt(session.sub);
        const { startOfDayUTC, endOfDayUTC } = getKSTDayRange();

        const existing = await prisma.missionLog.findFirst({
            where: {
                memberId,
                missionKey,
                claimedAt: { gte: startOfDayUTC, lt: endOfDayUTC },
            },
        });

        if (existing) {
            return NextResponse.json({ error: '이미 오늘 보상을 받았습니다.' }, { status: 400 });
        }

        await prisma.missionLog.create({
            data: {
                memberId,
                missionKey,
                reward: validMissions[missionKey],
            },
        });

        return NextResponse.json({ success: true, reward: validMissions[missionKey] });
    } catch (error) {
        console.error('Mission POST error:', error);
        return NextResponse.json({ error: '미션 보상 수령 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
