export interface Character {
    name: string;
    className: string;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    element: string;
    level: number;
    exp: number;
    gold: number;
    gem: number;
}

// 레벨별 필요 경험치 (레벨 1→2: 100, 2→3: 150, ...)
export function getExpForNextLevel(level: number): number {
    return 100 + (level - 1) * 50;
}

// 던전 난이도별 경험치
export const DUNGEON_EXP: Record<string, number> = {
    '쉬움': 30,
    '보통': 60,
    '어려움': 120,
};

export function loadCharacter(): Character | null {
    const saved = localStorage.getItem('superpet-character');
    if (!saved) return null;
    try {
        const char = JSON.parse(saved) as Character;
        // 기존 데이터 마이그레이션
        if (char.level == null || isNaN(char.level)) char.level = 1;
        if (char.exp == null || isNaN(char.exp)) char.exp = 0;
        if (char.gold == null || isNaN(char.gold)) char.gold = 0;
        if (char.gem == null || isNaN(char.gem)) char.gem = 0;
        return char;
    } catch {
        return null;
    }
}

export function saveCharacter(character: Character) {
    localStorage.setItem('superpet-character', JSON.stringify(character));
}

export function addGoldToCharacter(amount: number): Character {
    const character = loadCharacter();
    if (!character) throw new Error('No character');
    character.gold += amount;
    saveCharacter(character);
    return character;
}

export function addExpToCharacter(exp: number): { character: Character; leveledUp: boolean; levelsGained: number } {
    const character = loadCharacter();
    if (!character) throw new Error('No character');

    character.exp += exp;
    let leveledUp = false;
    let levelsGained = 0;

    let needed = getExpForNextLevel(character.level);
    while (character.exp >= needed) {
        character.exp -= needed;
        character.level += 1;
        levelsGained += 1;
        leveledUp = true;

        // 레벨업 시 스탯 증가
        character.hp += 5;
        character.attack += 2;
        character.defense += 2;
        character.speed += 2;

        needed = getExpForNextLevel(character.level);
    }

    saveCharacter(character);
    return { character, leveledUp, levelsGained };
}

export interface PetInfo {
    name: string;
    type: 'dog' | 'cat' | 'other';
    traits: string[];
}

export type ItemRarity = '일반' | '고급' | '희귀' | '에픽' | '전설';

export interface ItemStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}

export type StatRange = [number, number];

export interface GameItem {
    id: string;
    name: string;
    emoji: string;
    rarity: ItemRarity;
    description: string;
    statRanges: Partial<Record<keyof ItemStats, StatRange>>;
}

export interface InventoryItem {
    item: GameItem;
    quantity: number;
    stats: ItemStats;
}

export const ITEM_RARITY_COLORS: Record<ItemRarity, string> = {
    '일반': 'border-zinc-400 bg-zinc-500/10',
    '고급': 'border-green-400 bg-green-500/10',
    '희귀': 'border-blue-400 bg-blue-500/10',
    '에픽': 'border-purple-400 bg-purple-500/10',
    '전설': 'border-amber-400 bg-amber-500/10',
};

export const ITEM_RARITY_BORDER: Record<ItemRarity, string> = {
    '일반': 'border-zinc-400',
    '고급': 'border-green-400',
    '희귀': 'border-blue-400',
    '에픽': 'border-purple-400',
    '전설': 'border-amber-400',
};

export const ITEM_SELL_PRICE: Record<ItemRarity, number> = {
    '일반': 10,
    '고급': 30,
    '희귀': 80,
    '에픽': 200,
    '전설': 500,
};

export const ITEM_RARITY_TEXT: Record<ItemRarity, string> = {
    '일반': 'text-zinc-500',
    '고급': 'text-green-500',
    '희귀': 'text-blue-500',
    '에픽': 'text-purple-500',
    '전설': 'text-amber-500',
};

// 등급별 드롭 확률
export const ITEM_DROP_RATES: { rarity: ItemRarity; weight: number }[] = [
    { rarity: '일반', weight: 80.0 },
    { rarity: '고급', weight: 15.0 },
    { rarity: '희귀', weight: 4.5 },
    { rarity: '에픽', weight: 0.45 },
    { rarity: '전설', weight: 0.05 },
];

// 난이도별 드롭 개수
export const DUNGEON_DROP_COUNT: Record<string, number> = {
    '쉬움': 2,
    '보통': 3,
    '어려움': 4,
};

export const GAME_ITEMS: Record<string, GameItem> = {
    // 일반
    bone: {
        id: 'bone',
        name: '뼈다귀',
        emoji: '🦴',
        rarity: '일반',
        description: '기본적인 전리품. 펫에게 간식으로 줄 수 있다.',
        statRanges: { attack: [1, 5] },
    },
    potion: {
        id: 'potion',
        name: '회복 포션',
        emoji: '🧪',
        rarity: '일반',
        description: '체력을 회복시켜주는 기본 포션.',
        statRanges: { hp: [5, 15] },
    },
    // 고급
    enhanced_feed: {
        id: 'enhanced_feed',
        name: '강화 사료',
        emoji: '🥩',
        rarity: '고급',
        description: '영양이 풍부한 특제 사료. 근력이 올라간다.',
        statRanges: { attack: [3, 8], hp: [2, 6] },
    },
    agility_feather: {
        id: 'agility_feather',
        name: '민첩의 깃털',
        emoji: '🪶',
        rarity: '고급',
        description: '바람의 기운이 깃든 깃털. 발놀림이 빨라진다.',
        statRanges: { speed: [4, 10], defense: [1, 4] },
    },
    // 희귀
    magic_snack: {
        id: 'magic_snack',
        name: '마법 간식',
        emoji: '✨',
        rarity: '희귀',
        description: '마법이 깃든 특별한 간식. 먹으면 기분이 좋아진다.',
        statRanges: { attack: [3, 10], speed: [2, 8] },
    },
    shield_charm: {
        id: 'shield_charm',
        name: '수호의 부적',
        emoji: '🛡️',
        rarity: '희귀',
        description: '방어력을 일시적으로 높여주는 부적.',
        statRanges: { defense: [5, 12], hp: [3, 10] },
    },
    // 에픽
    dragon_claw: {
        id: 'dragon_claw',
        name: '용의 발톱',
        emoji: '🐲',
        rarity: '에픽',
        description: '고대 용의 발톱. 엄청난 파괴력이 느껴진다.',
        statRanges: { attack: [8, 18], speed: [4, 12] },
    },
    starlight_armor: {
        id: 'starlight_armor',
        name: '별빛 갑옷',
        emoji: '🌟',
        rarity: '에픽',
        description: '별의 축복을 받은 갑옷. 튼튼하면서도 가볍다.',
        statRanges: { defense: [8, 18], hp: [6, 15] },
    },
    // 전설
    legend_necklace: {
        id: 'legend_necklace',
        name: '전설의 목걸이',
        emoji: '📿',
        rarity: '전설',
        description: '드래곤의 비늘로 만든 전설적인 목걸이.',
        statRanges: { hp: [8, 20], attack: [5, 15], defense: [5, 15], speed: [5, 15] },
    },
};

function rollRarity(): ItemRarity {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const { rarity, weight } of ITEM_DROP_RATES) {
        cumulative += weight;
        if (roll < cumulative) return rarity;
    }
    return '일반';
}

export function rollItemDrop(): { itemId: string; item: GameItem } {
    const rarity = rollRarity();
    const candidates = Object.values(GAME_ITEMS).filter((i) => i.rarity === rarity);
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { itemId: picked.id, item: picked };
}

export function loadInventory(): InventoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('superpet-inventory');
        if (!saved) return [];
        const items = JSON.parse(saved) as InventoryItem[];
        // 기존 데이터 마이그레이션: stats 없으면 기본값
        for (const entry of items) {
            if (!entry.stats) {
                entry.stats = { hp: 0, attack: 0, defense: 0, speed: 0 };
            }
        }
        return items;
    } catch {
        return [];
    }
}

export function saveInventory(inventory: InventoryItem[]) {
    localStorage.setItem('superpet-inventory', JSON.stringify(inventory));
}

function rollStat(range: StatRange): number {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function generateItemStats(item: GameItem): ItemStats {
    const ranges = item.statRanges;
    return {
        hp: ranges.hp ? rollStat(ranges.hp) : 0,
        attack: ranges.attack ? rollStat(ranges.attack) : 0,
        defense: ranges.defense ? rollStat(ranges.defense) : 0,
        speed: ranges.speed ? rollStat(ranges.speed) : 0,
    };
}

export function addItemToInventory(itemId: string, quantity: number) {
    const item = GAME_ITEMS[itemId];
    if (!item) return;
    const inventory = loadInventory();
    const existing = inventory.find((i) => i.item.id === itemId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        inventory.push({ item, quantity, stats: generateItemStats(item) });
    }
    saveInventory(inventory);
}

export const PET_TYPES = [
    { key: 'dog' as const, label: '강아지' },
    { key: 'cat' as const, label: '고양이' },
    { key: 'other' as const, label: '기타' },
];

export const PET_TRAITS = [
    '용감한', '호기심 많은', '장난꾸러기', '충성스러운',
    '독립적인', '활발한', '느긋한', '다정한',
    '영리한', '겁쟁이', '먹보', '고집쟁이', '수줍은',
] as const;

const ELEMENTS = ['불', '물', '풍', '땅'] as const;

const CLASS_MAP: Record<string, string> = {
    hp: '수호 기사',
    attack: '전사',
    defense: '방패 수호자',
    speed: '그림자 닌자',
};

const BASE_STATS: Record<PetInfo['type'], { hp: number; attack: number; defense: number; speed: number }> = {
    dog:   { hp: 120, attack: 25, defense: 30, speed: 20 },
    cat:   { hp: 90,  attack: 35, defense: 15, speed: 40 },
    other: { hp: 100, attack: 30, defense: 25, speed: 25 },
};

const TRAIT_MODIFIERS: Record<string, Partial<Record<'hp' | 'attack' | 'defense' | 'speed', number>>> = {
    '용감한':      { attack: 10, hp: 10 },
    '호기심 많은':  { speed: 10, attack: 5 },
    '장난꾸러기':   { speed: 15, defense: -5 },
    '충성스러운':   { defense: 15, hp: 10 },
    '독립적인':    { attack: 10, speed: 5 },
    '활발한':      { speed: 10, hp: 5 },
    '느긋한':      { defense: 15, hp: 15 },
    '다정한':      { hp: 20, defense: 5 },
    '영리한':      { speed: 8, attack: 8 },
    '겁쟁이':      { speed: 20, attack: -5 },
    '먹보':        { hp: 25, speed: -5 },
    '고집쟁이':     { defense: 10, attack: 5 },
    '수줍은':       { defense: 8, speed: 8 },
};

export function generateCharacter(name: string, type: PetInfo['type'], traits: string[]): Character {
    const nameHash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const base = BASE_STATS[type];

    let hp = base.hp;
    let attack = base.attack;
    let defense = base.defense;
    let speed = base.speed;

    for (const trait of traits) {
        const mod = TRAIT_MODIFIERS[trait];
        if (mod) {
            hp += mod.hp ?? 0;
            attack += mod.attack ?? 0;
            defense += mod.defense ?? 0;
            speed += mod.speed ?? 0;
        }
    }

    // 이름 해시로 약간의 변동 추가
    hp += (nameHash % 15);
    attack += (nameHash % 10);
    defense += (nameHash % 8);
    speed += (nameHash % 12);

    const element = ELEMENTS[nameHash % ELEMENTS.length];

    // 가장 높은 스탯으로 직업 결정
    const statEntries = { hp, attack, defense, speed };
    const topStat = (Object.entries(statEntries) as [string, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
    const className = CLASS_MAP[topStat];

    return { name, className, hp, attack, defense, speed, element, level: 1, exp: 0, gold: 0, gem: 0 };
}
