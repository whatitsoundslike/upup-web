import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isValidUseSource } from '@/app/(main)/superpet/gemSources';

// POST: Gem 사용
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { amount, source, memo } = await request.json();

    // 유효성 검사
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: '유효한 금액을 입력해주세요.' }, { status: 400 });
    }

    if (!source || !isValidUseSource(source)) {
      return NextResponse.json({ error: '유효한 사용처를 입력해주세요.' }, { status: 400 });
    }

    const memberId = BigInt(session.sub);
    const useAmount = Math.floor(amount);

    // 현재 잔액 확인 (단일 SUM 쿼리)
    const balanceResult = await prisma.gemTransaction.aggregate({
      where: { memberId },
      _sum: { amount: true },
    });

    const currentBalance = balanceResult._sum.amount ?? 0;

    // 잔액 부족 체크
    if (currentBalance < useAmount) {
      return NextResponse.json({
        error: 'Gem이 부족합니다.',
        required: useAmount,
        balance: currentBalance,
      }, { status: 400 });
    }

    // Gem 사용 기록 (음수로 저장)
    await prisma.gemTransaction.create({
      data: {
        memberId,
        type: 'use',
        amount: -useAmount,
        source,
        memo: memo || null,
      },
    });

    const newBalance = currentBalance - useAmount;

    return NextResponse.json({
      success: true,
      used: useAmount,
      balance: newBalance,
    });
  } catch (error) {
    console.error('Gem use error:', error);
    return NextResponse.json({ error: 'Gem 사용 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
