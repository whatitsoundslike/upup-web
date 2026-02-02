import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SavedCharacter = {
  id?: string;
  name?: string;
  image?: string;
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  level?: number;
  className?: string;
  element?: string;
  equipment?: Record<
    string,
    | {
        stats?: {
            hp?: number;
            attack?: number;
            defense?: number;
            speed?: number;
        };
      }
    | null
  >;
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

function parseCharacters(data: unknown): SavedCharacter[] {
  if (!data || typeof data !== 'object') return [];
  const raw = (data as Record<string, unknown>)['characters'];
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedCharacter[]) : [];
  } catch {
    return [];
  }
}

function getScore(character: SavedCharacter): number {
  const equipment = character.equipment && typeof character.equipment === 'object'
    ? Object.values(character.equipment)
    : [];
  const equipTotals = equipment.reduce(
    (acc, item) => {
      if (!item?.stats) return acc;
      acc.hp += Number(item.stats.hp ?? 0);
      acc.attack += Number(item.stats.attack ?? 0);
      acc.defense += Number(item.stats.defense ?? 0);
      acc.speed += Number(item.stats.speed ?? 0);
      return acc;
    },
    { hp: 0, attack: 0, defense: 0, speed: 0 }
  );

  const attack = Number(character.attack ?? 0) + equipTotals.attack;
  const defense = Number(character.defense ?? 0) + equipTotals.defense;
  const speed = Number(character.speed ?? 0) + equipTotals.speed;
  const score = attack + defense + speed;
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.floor(score));
}

function getBestCharacter(characters: SavedCharacter[], rankCharacterId?: string | null) {
  if (!characters.length) return null;

  if (rankCharacterId) {
    const match = characters.find((char) => char.id === rankCharacterId);
    if (match) {
      return { character: match, score: getScore(match) };
    }
  }

  let best: SavedCharacter | null = null;
  let bestScore = 0;
  for (const character of characters) {
    const score = getScore(character);
    if (!best || score > bestScore) {
      best = character;
      bestScore = score;
    }
  }

  if (!best) return null;
  return { character: best, score: bestScore };
}

export async function GET() {
  try {
  const saves = await prisma.gameSave.findMany({
    orderBy: { rankScore: 'desc' },
    take: 20,
  });

  const rankings: RankingEntry[] = [];
  for (const save of saves) {
    const characters = parseCharacters(save.data);
    const best = getBestCharacter(characters, save.rankCharacterId);
    if (!best || !best.character?.id || !best.character?.name) continue;

      const equipment = best.character.equipment && typeof best.character.equipment === 'object'
        ? Object.values(best.character.equipment)
        : [];
      const equipTotals = equipment.reduce(
        (acc, item) => {
          if (!item?.stats) return acc;
          acc.hp += Number(item.stats.hp ?? 0);
          acc.attack += Number(item.stats.attack ?? 0);
          acc.defense += Number(item.stats.defense ?? 0);
          acc.speed += Number(item.stats.speed ?? 0);
          return acc;
        },
        { hp: 0, attack: 0, defense: 0, speed: 0 }
      );

      rankings.push({
        rankScore: Number(save.rankScore ?? best.score) || best.score,
        characterId: best.character.id,
        name: best.character.name,
        image: best.character.image ?? null,
        stats: {
          hp: (Number(best.character.hp ?? 0) || 0) + equipTotals.hp,
          attack: (Number(best.character.attack ?? 0) || 0) + equipTotals.attack,
          defense: (Number(best.character.defense ?? 0) || 0) + equipTotals.defense,
          speed: (Number(best.character.speed ?? 0) || 0) + equipTotals.speed,
        },
        level: Number(best.character.level ?? 0) || null,
        className: best.character.className ?? null,
        element: best.character.element ?? null,
      });
    }

    return NextResponse.json({ data: rankings });
  } catch (error) {
    console.error('Ranking list error:', error);
    return NextResponse.json({ error: '랭킹 데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}
