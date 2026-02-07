import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

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

type RankingEntry = {
  rankScore: number;
  characterId: string;
  name: string;
  image: string | null;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  level: number | null;
  className: string | null;
  element: string | null;
};

type GameSaveRaw = {
  rankScore: number;
  rankCharacterId: string | null;
  rankCharacter: RankCharacter | null;
};

const getCachedRankings = unstable_cache(
  async () => {
    // 미리 계산된 rankCharacter 데이터만 조회 (테스터 제외)
    const saves = await prisma.$queryRaw<GameSaveRaw[]>`
      SELECT rankScore, rankCharacterId, rankCharacter
      FROM GameSave
      WHERE rankScore > 0 AND tester = false AND rankCharacter IS NOT NULL
      ORDER BY rankScore DESC
      LIMIT 20
    `;

    const rankings: RankingEntry[] = [];
    for (const save of saves) {
      if (!save.rankCharacterId) continue;

      // rankCharacter가 있는 경우 ($queryRaw는 JSON을 객체로 반환)
      const char = save.rankCharacter;
      if (char && char.stats) {
        rankings.push({
          rankScore: save.rankScore,
          characterId: save.rankCharacterId,
          name: char.name || '알 수 없음',
          image: char.imageUrl ?? null,
          stats: char.stats,
          level: char.level ?? null,
          className: char.className ?? null,
          element: char.element ?? null,
        });
        continue;
      }

      // rankCharacter가 없는 경우 (기존 데이터) - 기본값으로 표시
      rankings.push({
        rankScore: save.rankScore,
        characterId: save.rankCharacterId,
        name: '알 수 없음',
        image: null,
        stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
        level: null,
        className: null,
        element: null,
      });
    }

    return { data: rankings, updatedAt: new Date().toISOString() };
  },
  ['superpet-rankings'],
  { revalidate: 3600 }
);

export async function GET() {
  try {
    const result = await getCachedRankings();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ranking list error:', error);
    return NextResponse.json({ error: '랭킹 데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}
