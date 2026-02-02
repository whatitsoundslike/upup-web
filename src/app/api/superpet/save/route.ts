import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const memberId = BigInt(session.sub);
    const save = await prisma.gameSave.findUnique({ where: { memberId } });

    return NextResponse.json({ data: save?.data ?? null });
  } catch (error) {
    console.error('Game save load error:', error);
    return NextResponse.json({ error: '저장 데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data } = await request.json();
    if (!data) {
      return NextResponse.json({ error: '저장할 데이터가 없습니다.' }, { status: 400 });
    }

    const memberId = BigInt(session.sub);
    await prisma.gameSave.upsert({
      where: { memberId },
      update: { data },
      create: { memberId, data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
