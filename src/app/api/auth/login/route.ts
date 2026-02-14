import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/config/auth';

export async function POST(request: Request) {
  try {
    const { uid, password } = await request.json();

    if (!uid || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({ where: { uid } });
    if (!member) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, member.password);
    if (!isValid) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    if (member.isDeleted) {
      return NextResponse.json(
        { error: '탈퇴한 계정입니다.' },
        { status: 403 }
      );
    }

    const token = await signToken({
      sub: member.id.toString(),
      uid: member.uid,
      email: member.email,
      name: member.name,
    });

    const response = NextResponse.json({
      user: {
        id: member.id.toString(),
        uid: member.uid,
        email: member.email,
        name: member.name,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 1,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
