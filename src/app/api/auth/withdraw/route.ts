import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/config/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const memberId = BigInt(session.sub);

    // 트랜잭션으로 처리: 탈퇴 플래그 + 룸 잠금 + 키 삭제
    await prisma.$transaction(async (tx) => {
      // 1. 회원 탈퇴 플래그
      await tx.member.update({
        where: { id: memberId },
        data: { isDeleted: true },
      });

      // 2. 해당 멤버의 모든 룸 잠금
      const rooms = await tx.room.findMany({
        where: { memberId },
        select: { id: true },
      });

      if (rooms.length > 0) {
        const roomIds = rooms.map((r) => r.id);

        await tx.room.updateMany({
          where: { memberId },
          data: { isLocked: true },
        });

        // 3. 해당 룸들의 키 등록 삭제 후 키 삭제
        await tx.roomKeyRegistration.deleteMany({
          where: { roomKey: { roomId: { in: roomIds } } },
        });

        await tx.roomKey.deleteMany({
          where: { roomId: { in: roomIds } },
        });
      }
    });

    // 쿠키 삭제 (로그아웃)
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { error: '회원 탈퇴 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
