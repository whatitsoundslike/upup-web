import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type SavedEquipmentItem = {
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
};

type SavedEquipment = Record<string, SavedEquipmentItem | null> | null;

type SavedCharacter = {
  id?: string;
  attack?: number;
  defense?: number;
  speed?: number;
  equipment?: SavedEquipment;
};

function sumEquipmentStats(equipment?: SavedEquipment) {
  const totals = { attack: 0, defense: 0, speed: 0 };
  if (!equipment || typeof equipment !== 'object') return totals;

  for (const item of Object.values(equipment)) {
    if (!item?.stats) continue;
    totals.attack += Number(item.stats.attack ?? 0);
    totals.defense += Number(item.stats.defense ?? 0);
    totals.speed += Number(item.stats.speed ?? 0);
  }

  return totals;
}

function getRankFromData(
  data: Record<string, string | null>
): { score: number; characterId: string | null } {
  const charactersRaw = data['characters'];
  if (!charactersRaw) return { score: 0, characterId: null };

  try {
    const characters = JSON.parse(charactersRaw) as SavedCharacter[];
    if (!Array.isArray(characters) || characters.length === 0) {
      return { score: 0, characterId: null };
    }

    let maxScore = 0;
    let maxId: string | null = null;
    for (const character of characters) {
      const equipStats = sumEquipmentStats(character?.equipment);
      const attack = Number(character?.attack ?? 0) + equipStats.attack;
      const defense = Number(character?.defense ?? 0) + equipStats.defense;
      const speed = Number(character?.speed ?? 0) + equipStats.speed;
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
