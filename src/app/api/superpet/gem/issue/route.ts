import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isValidIssueSource } from '@/app/(main)/superpet/gemSources';

// POST: Gem 지급 (시스템/관리자용)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { amount, source, memo, targetMemberId } = await request.json();

    // 유효성 검사
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: '유효한 금액을 입력해주세요.' }, { status: 400 });
    }

    if (!source || !isValidIssueSource(source)) {
      return NextResponse.json({ error: '유효한 지급 출처를 입력해주세요.' }, { status: 400 });
    }

    // targetMemberId가 있으면 해당 유저에게, 없으면 본인에게 지급
    // 참고: 실제 운영에서는 admin 권한 체크 필요
    const memberId = targetMemberId ? BigInt(targetMemberId) : BigInt(session.sub);

    const issueAmount = Math.floor(amount);

    // Gem 지급 기록 (양수로 저장)
    await prisma.gemTransaction.create({
      data: {
        memberId,
        type: 'issue',
        amount: issueAmount,
        source,
        memo: memo || null,
      },
    });

    // 새 잔액 계산 (단일 SUM 쿼리)
    const result = await prisma.gemTransaction.aggregate({
      where: { memberId },
      _sum: { amount: true },
    });

    const balance = result._sum.amount ?? 0;

    return NextResponse.json({
      success: true,
      issued: issueAmount,
      balance,
    });
  } catch (error) {
    console.error('Gem issue error:', error);
    return NextResponse.json({ error: 'Gem 지급 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
