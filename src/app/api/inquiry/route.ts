import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const serializeBigInt = (data: unknown) =>
  JSON.parse(JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { memberId: BigInt(session.sub) },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(serializeBigInt(inquiries));
  } catch (error) {
    console.error('Inquiry list error:', error);
    return NextResponse.json({ error: '문의 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        memberId: BigInt(session.sub),
        title: title.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(serializeBigInt(inquiry), { status: 201 });
  } catch (error) {
    console.error('Inquiry create error:', error);
    return NextResponse.json({ error: '문의 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
