import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type SavedEquipmentItem = {
  item?: {
    stats?: {
      hp?: number;
      attack?: number;
      defense?: number;
      speed?: number;
    };
  };
  enhanceLevel?: number;
};

type SavedEquipment = Record<string, SavedEquipmentItem | null> | null;

type SavedCharacter = {
  id?: string;
  name?: string;
  level?: number;
  className?: string;
  element?: string;
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  equipment?: SavedEquipment;
  image?: string;
  videoUrl?: string;
};

type RankCharacter = {
  name: string;
  level: number;
  className: string | null;
  element: string | null;
  imageUrl: string | null;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

function sumEquipmentStats(equipment?: SavedEquipment) {
  const totals = { hp: 0, attack: 0, defense: 0, speed: 0 };
  if (!equipment || typeof equipment !== 'object') return totals;

  for (const equippedItem of Object.values(equipment)) {
    if (!equippedItem?.item?.stats) continue;
    const stats = equippedItem.item.stats;
    const enhanceLevel = equippedItem.enhanceLevel ?? 0;
    // 강화 레벨당 10% 보너스
    const multiplier = 1 + enhanceLevel * 0.1;
    totals.hp += Math.floor(Number(stats.hp ?? 0) * multiplier);
    totals.attack += Math.floor(Number(stats.attack ?? 0) * multiplier);
    totals.defense += Math.floor(Number(stats.defense ?? 0) * multiplier);
    totals.speed += Math.floor(Number(stats.speed ?? 0) * multiplier);
  }

  return totals;
}

function getRankFromData(
  data: Record<string, string | null>
): {
  score: number;
  characterId: string | null;
  character: RankCharacter | null;
} {
  const charactersRaw = data['characters'];
  const activeCharacterId = data['active-character'];

  if (!charactersRaw || !activeCharacterId) {
    return { score: 0, characterId: null, character: null };
  }

  try {
    const characters = JSON.parse(charactersRaw) as SavedCharacter[];
    if (!Array.isArray(characters) || characters.length === 0) {
      return { score: 0, characterId: null, character: null };
    }

    // 현재 선택된 캐릭터 찾기
    const activeCharacter = characters.find(c => c.id === activeCharacterId);
    if (!activeCharacter) {
      return { score: 0, characterId: null, character: null };
    }

    // 장비 스탯 계산
    const equipStats = sumEquipmentStats(activeCharacter.equipment);

    // 총 스탯 계산
    const totalStats = {
      hp: Number(activeCharacter.hp ?? 0) + equipStats.hp,
      attack: Number(activeCharacter.attack ?? 0) + equipStats.attack,
      defense: Number(activeCharacter.defense ?? 0) + equipStats.defense,
      speed: Number(activeCharacter.speed ?? 0) + equipStats.speed,
    };

    // 랭크 점수 = 공격력 + 방어력 + 속도
    const score = totalStats.attack + totalStats.defense + totalStats.speed;

    if (!Number.isFinite(score)) {
      return { score: 0, characterId: null, character: null };
    }

    // 랭킹용 캐릭터 정보 (imageUrl 포함)
    const rankCharacter: RankCharacter = {
      name: activeCharacter.name || '알 수 없음',
      level: Number(activeCharacter.level ?? 1),
      className: activeCharacter.className || null,
      element: activeCharacter.element || null,
      imageUrl: activeCharacter.image || activeCharacter.videoUrl || null,
      stats: totalStats,
    };

    return {
      score: Math.max(0, Math.floor(score)),
      characterId: activeCharacter.id ?? null,
      character: rankCharacter,
    };
  } catch {
    return { score: 0, characterId: null, character: null };
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const memberId = BigInt(session.sub);
    const gameSessionId = request.headers.get('X-Game-Session-Id');

    const save = await prisma.gameSave.findUnique({ where: { memberId } });

    // 세션 ID 검증 (gameSessionId가 있는 경우에만)
    if (gameSessionId && save?.gameSessionId && save.gameSessionId !== gameSessionId) {
      return NextResponse.json(
        { error: 'SESSION_EXPIRED', message: '다른 기기에서 접속하여 현재 세션이 종료되었습니다.' },
        { status: 403 }
      );
    }

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

    const gameSessionId = request.headers.get('X-Game-Session-Id');
    const { data } = await request.json();
    if (!data) {
      return NextResponse.json({ error: '저장할 데이터가 없습니다.' }, { status: 400 });
    }

    const memberId = BigInt(session.sub);

    // 세션 ID 검증
    if (gameSessionId) {
      const existingSave = await prisma.gameSave.findUnique({
        where: { memberId },
        select: { gameSessionId: true }
      });

      if (existingSave?.gameSessionId && existingSave.gameSessionId !== gameSessionId) {
        return NextResponse.json(
          { error: 'SESSION_EXPIRED', message: '다른 기기에서 접속하여 현재 세션이 종료되었습니다.' },
          { status: 403 }
        );
      }
    }
    const rank = getRankFromData(data);
    const rankCharacterJson = rank.character ? JSON.stringify(rank.character) : null;

    // Raw query로 upsert
    await prisma.$executeRaw`
      INSERT INTO GameSave (memberId, data, rankScore, rankCharacterId, rankCharacter, updatedAt)
      VALUES (${memberId}, ${JSON.stringify(data)}, ${rank.score}, ${rank.characterId}, ${rankCharacterJson}, NOW())
      ON DUPLICATE KEY UPDATE
        data = ${JSON.stringify(data)},
        rankScore = ${rank.score},
        rankCharacterId = ${rank.characterId},
        rankCharacter = ${rankCharacterJson},
        updatedAt = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
