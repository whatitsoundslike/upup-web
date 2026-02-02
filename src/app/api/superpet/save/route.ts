import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function getRankFromData(
  data: Record<string, string | null>
): { score: number; characterId: string | null } {
  const charactersRaw = data['characters'];
  if (!charactersRaw) return { score: 0, characterId: null };

  try {
    const characters = JSON.parse(charactersRaw) as Array<{
      id?: string;
      attack?: number;
      defense?: number;
      speed?: number;
    }>;
    if (!Array.isArray(characters) || characters.length === 0) {
      return { score: 0, characterId: null };
    }

    let maxScore = 0;
    let maxId: string | null = null;
    for (const character of characters) {
      const attack = Number(character?.attack ?? 0);
      const defense = Number(character?.defense ?? 0);
      const speed = Number(character?.speed ?? 0);
      const score = attack + defense + speed;
      if (score > maxScore) {
        maxScore = score;
        maxId = character?.id ?? null;
      }
    }

    if (!Number.isFinite(maxScore)) return { score: 0, characterId: null };

    return {
      score: Math.max(0, Math.floor(maxScore)),
      characterId: maxId,
    };
  } catch {
    return { score: 0, characterId: null };
  }
}

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
    const rank = getRankFromData(data);
    await prisma.gameSave.upsert({
      where: { memberId },
      update: { data, rankScore: rank.score, rankCharacterId: rank.characterId },
      create: { memberId, data, rankScore: rank.score, rankCharacterId: rank.characterId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
