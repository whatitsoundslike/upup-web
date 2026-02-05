import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: 현재 Gem 잔액 조회
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const memberId = BigInt(session.sub);

    // 단일 SUM 쿼리로 잔액 계산 (양수: 지급, 음수: 사용)
    const result = await prisma.gemTransaction.aggregate({
      where: { memberId },
      _sum: { amount: true },
    });

    const balance = result._sum.amount ?? 0;

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Gem balance error:', error);
    return NextResponse.json({ error: 'Gem 잔액 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
