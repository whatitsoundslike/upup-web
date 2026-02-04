import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession, signToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/config/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await request.json();

    const member = await prisma.member.findUnique({
      where: { id: BigInt(session.sub) },
    });
    if (!member) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 비밀번호 변경
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: '현재 비밀번호를 입력해주세요.' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, member.password);
      if (!isValid) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
      }
    }

    // 닉네임 유효성
    if (name !== undefined && name !== null && name.length < 2) {
      return NextResponse.json({ error: '닉네임은 2자 이상이어야 합니다.' }, { status: 400 });
    }

    // 업데이트
    const updateData: { name?: string; password?: string } = {};
    if (name !== undefined && name !== null) updateData.name = name;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.member.update({
      where: { id: BigInt(session.sub) },
      data: updateData,
    });

    // JWT 재발급
    const token = await signToken({
      sub: updated.id.toString(),
      uid: updated.uid,
      email: updated.email,
      name: updated.name,
    });

    const response = NextResponse.json({
      user: {
        id: updated.id.toString(),
        uid: updated.uid,
        email: updated.email,
        name: updated.name,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: '프로필 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
