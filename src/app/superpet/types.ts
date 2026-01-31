export interface Character {
    name: string;
    className: string;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    element: string;
}

export interface PetInfo {
    name: string;
    type: 'dog' | 'cat' | 'other';
    traits: string[];
}

export type ItemRarity = '일반' | '희귀' | '전설';

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
    '희귀': 'border-blue-400 bg-blue-500/10',
    '전설': 'border-amber-400 bg-amber-500/10',
};

export const ITEM_RARITY_BORDER: Record<ItemRarity, string> = {
    '일반': 'border-zinc-400',
    '희귀': 'border-blue-400',
    '전설': 'border-amber-400',
};

export const ITEM_RARITY_TEXT: Record<ItemRarity, string> = {
    '일반': 'text-zinc-500',
    '희귀': 'text-blue-500',
    '전설': 'text-amber-500',
};

export const GAME_ITEMS: Record<string, GameItem> = {
    bone: {
        id: 'bone',
        name: '뼈다귀',
        emoji: '🦴',
        rarity: '일반',
        description: '기본적인 전리품. 펫에게 간식으로 줄 수 있다.',
        statRanges: { attack: [1, 5] },
    },
    magic_snack: {
        id: 'magic_snack',
        name: '마법 간식',
        emoji: '✨',
        rarity: '희귀',
        description: '마법이 깃든 특별한 간식. 먹으면 기분이 좋아진다.',
        statRanges: { attack: [3, 10], speed: [2, 8] },
    },
    legend_necklace: {
        id: 'legend_necklace',
        name: '전설의 목걸이',
        emoji: '📿',
        rarity: '전설',
        description: '드래곤의 비늘로 만든 전설적인 목걸이.',
        statRanges: { hp: [8, 20], attack: [5, 15], defense: [5, 15], speed: [5, 15] },
    },
    potion: {
        id: 'potion',
        name: '회복 포션',
        emoji: '🧪',
        rarity: '일반',
        description: '체력을 회복시켜주는 기본 포션.',
        statRanges: { hp: [5, 15] },
    },
    shield_charm: {
        id: 'shield_charm',
        name: '수호의 부적',
        emoji: '🛡️',
        rarity: '희귀',
        description: '방어력을 일시적으로 높여주는 부적.',
        statRanges: { defense: [5, 12], hp: [3, 10] },
    },
};

export function loadInventory(): InventoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('superpet-inventory');
        return saved ? JSON.parse(saved) : [];
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

    return { name, className, hp, attack, defense, speed, element };
}
