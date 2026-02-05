import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

type ItemRarity = '일반' | '고급' | '희귀' | '에픽' | '전설';
type EquipmentSlot = '무기' | '갑옷' | '방패' | '목걸이' | '반지';

type EquippedItem = {
  item?: {
    stats?: {
      hp?: number;
      attack?: number;
      defense?: number;
      speed?: number;
    };
    equipmentSlot?: EquipmentSlot;
    rarity?: ItemRarity;
  };
  enhanceLevel?: number;
  // 레거시: 이전 버전 호환
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
};

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
  equipment?: Record<string, EquippedItem | null>;
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

// 등급별 무기 강화 공격력 보너스 (강화 1당)
const WEAPON_ENHANCE_ATTACK: Record<ItemRarity, number> = {
  '일반': 1,
  '고급': 2,
  '희귀': 3,
  '에픽': 4,
  '전설': 5,
};

function getRequiredScrollType(slot: EquipmentSlot): 'weapon' | 'armor' | 'accessory' {
  switch (slot) {
    case '무기':
      return 'weapon';
    case '갑옷':
    case '방패':
      return 'armor';
    case '목걸이':
    case '반지':
      return 'accessory';
  }
}

// 강화 보너스 계산
function getEnhancementBonus(
  enhanceLevel: number,
  slot?: EquipmentSlot,
  rarity?: ItemRarity
): { hp: number; attack: number; defense: number; speed: number } {
  if (!slot || !rarity || enhanceLevel <= 0) {
    return { hp: 0, attack: 0, defense: 0, speed: 0 };
  }

  const scrollType = getRequiredScrollType(slot);

  switch (scrollType) {
    case 'weapon':
      return {
        hp: 0,
        attack: WEAPON_ENHANCE_ATTACK[rarity] * enhanceLevel,
        defense: 0,
        speed: 0,
      };
    case 'armor':
      return {
        hp: 0,
        attack: 0,
        defense: 1 * enhanceLevel,
        speed: 0,
      };
    case 'accessory':
      return {
        hp: 30 * enhanceLevel,
        attack: 0,
        defense: 0,
        speed: 1 * enhanceLevel,
      };
  }
}

// 장비 스탯 계산 (기본 스탯 + 강화 보너스)
function getEquipmentStats(equipped: EquippedItem, slot: string): { hp: number; attack: number; defense: number; speed: number } {
  // 기본 스탯 가져오기 (item.stats 또는 레거시 stats)
  const baseStats = equipped.item?.stats ?? equipped.stats ?? { hp: 0, attack: 0, defense: 0, speed: 0 };
  const hp = Number(baseStats.hp ?? 0);
  const attack = Number(baseStats.attack ?? 0);
  const defense = Number(baseStats.defense ?? 0);
  const speed = Number(baseStats.speed ?? 0);

  // 강화 보너스 계산
  const enhanceLevel = Number(equipped.enhanceLevel ?? 0);
  const equipSlot = (equipped.item?.equipmentSlot ?? slot) as EquipmentSlot;
  const rarity = equipped.item?.rarity;
  const bonus = getEnhancementBonus(enhanceLevel, equipSlot, rarity);

  return {
    hp: hp + bonus.hp,
    attack: attack + bonus.attack,
    defense: defense + bonus.defense,
    speed: speed + bonus.speed,
  };
}

function getScore(character: SavedCharacter): number {
  const equipment = character.equipment && typeof character.equipment === 'object'
    ? Object.entries(character.equipment)
    : [];
  const equipTotals = equipment.reduce(
    (acc, [slot, item]) => {
      if (!item) return acc;
      const stats = getEquipmentStats(item, slot);
      acc.hp += stats.hp;
      acc.attack += stats.attack;
      acc.defense += stats.defense;
      acc.speed += stats.speed;
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

const getCachedRankings = unstable_cache(
  async () => {
    const topIds = await prisma.gameSave.findMany({
      select: { id: true },
      orderBy: { rankScore: 'desc' },
      take: 20,
    });

    const saves = await prisma.gameSave.findMany({
      where: { id: { in: topIds.map((s) => s.id) } },
      orderBy: { rankScore: 'desc' },
    });

    const rankings: RankingEntry[] = [];
    for (const save of saves) {
      const characters = parseCharacters(save.data);
      const best = getBestCharacter(characters, save.rankCharacterId);
      if (!best || !best.character?.id || !best.character?.name) continue;

      const equipment = best.character.equipment && typeof best.character.equipment === 'object'
        ? Object.entries(best.character.equipment)
        : [];
      const equipTotals = equipment.reduce(
        (acc, [slot, item]) => {
          if (!item) return acc;
          const stats = getEquipmentStats(item, slot);
          acc.hp += stats.hp;
          acc.attack += stats.attack;
          acc.defense += stats.defense;
          acc.speed += stats.speed;
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
