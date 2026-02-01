import { getItem, setItem, removeItem } from './storage';

// 장착 부위 타입
export type EquipmentSlot = '투구' | '갑옷' | '장갑' | '부츠' | '망토' | '무기' | '방패' | '목걸이' | '반지';

// 장착중인 장비
export interface EquippedItems {
    투구: GameItem | null;
    갑옷: GameItem | null;
    망토: GameItem | null;
    무기: GameItem | null;
    방패: GameItem | null;
    장갑: GameItem | null;
    부츠: GameItem | null;
    목걸이: GameItem | null;
    반지: GameItem | null;
}

export interface Character {
    id: string;
    name: string;
    className: string;
    hp: number;
    currentHp: number;
    attack: number;
    defense: number;
    speed: number;
    element: string;
    level: number;
    exp: number;
    gold: number;
    gem: number;
    equipment: EquippedItems;
    image?: string;
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

// 기존 단일 캐릭터 데이터 로드 (마이그레이션용)
function _loadSingleCharacterMigration(): Character | null {
    const saved = getItem('character');
    if (!saved) return null;
    try {
        const char = JSON.parse(saved) as Character;
        // 기존 데이터 마이그레이션
        if (!char.id) char.id = 'char-' + Date.now();
        if (char.level == null || isNaN(char.level)) char.level = 1;
        if (char.exp == null || isNaN(char.exp)) char.exp = 0;
        if (char.gold == null || isNaN(char.gold)) char.gold = 0;
        if (char.gem == null || isNaN(char.gem)) char.gem = 0;
        if (char.currentHp == null || isNaN(char.currentHp)) char.currentHp = char.hp;
        // 장비 데이터 마이그레이션
        if (!char.equipment) {
            char.equipment = {
                투구: null,
                갑옷: null,
                망토: null,
                무기: null,
                방패: null,
                장갑: null,
                부츠: null,
                목걸이: null,
                반지: null,
            };
        }
        return char;
    } catch {
        return null;
    }
}

// 마이그레이션 로직: 기존 단일 캐릭터 데이터를 새 다중 캐릭터 시스템으로 옮김
export function migrateCharacterData() {
    const singleChar = _loadSingleCharacterMigration();
    if (singleChar) {
        const allChars = loadAllCharacters();
        if (!allChars.some(c => c.id === singleChar.id)) {
            allChars.push(singleChar);
            saveAllCharacters(allChars);
            setActiveCharacter(singleChar.id);
            removeItem('character'); // Remove old single character data
        }
    }
}

export function loadCharacter(): Character | null {
    try {
        const activeId = getItem('active-character');
        if (!activeId) return null;

        const allChars = loadAllCharacters();
        return allChars.find(c => c.id === activeId) || null;
    } catch {
        return null;
    }
}

export function saveCharacter(character: Character) {
    const allChars = loadAllCharacters();
    const index = allChars.findIndex(c => c.id === character.id);
    if (index >= 0) {
        allChars[index] = character;
        saveAllCharacters(allChars);
    }
}

// 모든 캐릭터 로드
export function loadAllCharacters(): Character[] {
    try {
        const data = getItem('characters');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// 모든 캐릭터 저장
export function saveAllCharacters(characters: Character[]) {
    setItem('characters', JSON.stringify(characters));
}

// 새 캐릭터 추가 (최대 3개)
export function addCharacter(character: Character): boolean {
    const allChars = loadAllCharacters();
    if (allChars.length >= 3) return false;

    allChars.push(character);
    saveAllCharacters(allChars);
    setActiveCharacter(character.id);
    return true;
}

// 캐릭터 삭제
export function deleteCharacter(characterId: string) {
    const allChars = loadAllCharacters();
    const filtered = allChars.filter(c => c.id !== characterId);
    saveAllCharacters(filtered);

    // 활성 캐릭터가 삭제된 경우 다른 캐릭터를 활성화
    const activeId = getItem('active-character');
    if (activeId === characterId) {
        if (filtered.length > 0) {
            setActiveCharacter(filtered[0].id);
        } else {
            removeItem('active-character');
        }
    }
}

// 활성 캐릭터 설정
export function setActiveCharacter(characterId: string) {
    setItem('active-character', characterId);
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
        character.attack += 1;
        character.defense += 1;
        character.speed += 1;

        needed = getExpForNextLevel(character.level);
    }

    saveCharacter(character);
    return { character, leveledUp, levelsGained };
}

export interface PetInfo {
    name: string;
    type: 'dog' | 'cat' | 'bird' | 'other';
    traits: string[];
}

export type ItemRarity = '일반' | '고급' | '희귀' | '에픽' | '전설';

// 아이템 타입
export type ItemType = 'equipment' | 'food';

export interface ItemStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}

export interface GameItem {
    id: string;
    name: string;
    emoji: string;
    rarity: ItemRarity;
    stats: ItemStats;
    type: ItemType;
    equipmentSlot?: EquipmentSlot; // equipment 타입일 경우 장착 부위
    shopGoldPrice?: number; // 골드 상점 구매가
    shopGemPrice?: number; // 젬 상점 구매가
}

export interface InventoryItem {
    item: GameItem;
    equipedItem: GameItem[];
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

export const GAME_ITEMS: Record<string, GameItem> = {
    // 일반 - 음식
    feed: {
        id: 'feed',
        name: '사료',
        emoji: '🥫',
        rarity: '일반',
        stats: { hp: 50, attack: 0, defense: 0, speed: 0 },
        type: 'food',
        shopGoldPrice: 50,
    },
    // 고급 - 음식
    dubai_cookie: {
        id: 'dubai_cookie',
        name: '두바이 쫀득 쿠키',
        emoji: '🍪',
        rarity: '고급',
        stats: { hp: 100, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    // 희귀 - 음식
    meat: {
        id: 'meat',
        name: '고기',
        emoji: '🥩',
        rarity: '희귀',
        stats: { hp: 200, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    // 전설 - 음식
    legend_meat: {
        id: 'legend_meat',
        name: '전설의 고기',
        emoji: '🍖',
        rarity: '전설',
        stats: { hp: 1000, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },

    // === 장비 아이템 ===
    // 투구
    iron_helmet: {
        id: 'iron_helmet',
        name: '철제 투구',
        emoji: '⛑️',
        rarity: '일반',
        stats: { hp: 5, attack: 0, defense: 3, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },
    bronze_helmet: {
        id: 'bronze_helmet',
        name: '청동 투구',
        emoji: '🪖',
        rarity: '고급',
        stats: { hp: 8, attack: 0, defense: 5, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },
    knight_helmet: {
        id: 'knight_helmet',
        name: '기사의 투구',
        emoji: '🛡️',
        rarity: '희귀',
        stats: { hp: 10, attack: 0, defense: 8, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },
    phoenix_helmet: {
        id: 'phoenix_helmet',
        name: '불사조 투구',
        emoji: '🔥',
        rarity: '에픽',
        stats: { hp: 15, attack: 2, defense: 11, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },
    dragon_helmet: {
        id: 'dragon_helmet',
        name: '드래곤 투구',
        emoji: '🐉',
        rarity: '전설',
        stats: { hp: 20, attack: 5, defense: 15, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },

    // 갑옷
    leather_armor: {
        id: 'leather_armor',
        name: '가죽 갑옷',
        emoji: '🦺',
        rarity: '일반',
        stats: { hp: 8, attack: 0, defense: 5, speed: 2 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    chain_armor: {
        id: 'chain_armor',
        name: '사슬 갑옷',
        emoji: '⛓️',
        rarity: '고급',
        stats: { hp: 12, attack: 0, defense: 8, speed: 0 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    plate_armor: {
        id: 'plate_armor',
        name: '판금 갑옷',
        emoji: '🪨',
        rarity: '희귀',
        stats: { hp: 15, attack: 0, defense: 10, speed: -1 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    starlight_armor: {
        id: 'starlight_armor',
        name: '별빛 갑옷',
        emoji: '🌟',
        rarity: '에픽',
        stats: { hp: 10, attack: 0, defense: 13, speed: 0 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    dragon_armor: {
        id: 'dragon_armor',
        name: '드래곤 갑옷',
        emoji: '🐲',
        rarity: '전설',
        stats: { hp: 20, attack: 5, defense: 15, speed: 0 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },

    // 장갑
    cloth_gloves: {
        id: 'cloth_gloves',
        name: '천 장갑',
        emoji: '🧤',
        rarity: '일반',
        stats: { hp: 0, attack: 2, defense: 1, speed: 0 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },
    leather_gloves: {
        id: 'leather_gloves',
        name: '가죽 장갑',
        emoji: '🤎',
        rarity: '고급',
        stats: { hp: 0, attack: 4, defense: 2, speed: 0 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },
    steel_gauntlets: {
        id: 'steel_gauntlets',
        name: '강철 건틀릿',
        emoji: '🦾',
        rarity: '희귀',
        stats: { hp: 0, attack: 5, defense: 5, speed: 0 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },
    ogre_power_gauntlet: {
        id: 'ogre_power_gauntlet',
        name: '오우거 파워 건틀릿',
        emoji: '🥊',
        rarity: '에픽',
        stats: { hp: 0, attack: 20, defense: 3, speed: 0 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },
    titan_fists: {
        id: 'titan_fists',
        name: '타이탄의 주먹',
        emoji: '👊',
        rarity: '전설',
        stats: { hp: 20, attack: 15, defense: 10, speed: 5 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },

    // 부츠
    running_shoes: {
        id: 'running_shoes',
        name: '러닝화',
        emoji: '👟',
        rarity: '일반',
        stats: { hp: 0, attack: 0, defense: 0, speed: 5 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },
    leather_boots: {
        id: 'leather_boots',
        name: '가죽 부츠',
        emoji: '👢',
        rarity: '고급',
        stats: { hp: 0, attack: 0, defense: 2, speed: 7 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },
    wind_boots: {
        id: 'wind_boots',
        name: '바람의 부츠',
        emoji: '🥾',
        rarity: '희귀',
        stats: { hp: 0, attack: 0, defense: 3, speed: 10 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },
    thunder_boots: {
        id: 'thunder_boots',
        name: '번개 부츠',
        emoji: '⚡',
        rarity: '에픽',
        stats: { hp: 0, attack: 0, defense: 3, speed: 15 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },
    pegasus_boots: {
        id: 'pegasus_boots',
        name: '페가수스 부츠',
        emoji: '🦄',
        rarity: '전설',
        stats: { hp: 10, attack: 0, defense: 5, speed: 20 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },

    // 망토
    simple_cloak: {
        id: 'simple_cloak',
        name: '간단한 망토',
        emoji: '🧥',
        rarity: '일반',
        stats: { hp: 3, attack: 0, defense: 2, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },
    traveler_cloak: {
        id: 'traveler_cloak',
        name: '여행자의 망토',
        emoji: '🧣',
        rarity: '고급',
        stats: { hp: 5, attack: 0, defense: 4, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },
    mage_cloak: {
        id: 'mage_cloak',
        name: '마법사의 망토',
        emoji: '🌀',
        rarity: '희귀',
        stats: { hp: 7, attack: 3, defense: 5, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },
    shadow_cloak: {
        id: 'shadow_cloak',
        name: '그림자 망토',
        emoji: '🦇',
        rarity: '에픽',
        stats: { hp: 8, attack: 5, defense: 8, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },
    celestial_cloak: {
        id: 'celestial_cloak',
        name: '천상의 망토',
        emoji: '🌌',
        rarity: '전설',
        stats: { hp: 15, attack: 8, defense: 10, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },

    // 무기
    wooden_sword: {
        id: 'wooden_sword',
        name: '나무 검',
        emoji: '🗡️',
        rarity: '일반',
        stats: { hp: 0, attack: 5, defense: 0, speed: 0 },
        type: 'equipment',
        equipmentSlot: '무기',
    },
    iron_sword: {
        id: 'iron_sword',
        name: '철 검',
        emoji: '🗡️',
        rarity: '고급',
        stats: { hp: 0, attack: 8, defense: 0, speed: 0 },
        type: 'equipment',
        equipmentSlot: '무기',
    },
    katana: {
        id: 'katana',
        name: '일본도',
        emoji: '🗡️',
        rarity: '희귀',
        stats: { hp: 0, attack: 15, defense: 0, speed: 0 },
        type: 'equipment',
        equipmentSlot: '무기',
    },
    shadow_blade: {
        id: 'shadow_blade',
        name: '그림자 칼날',
        emoji: '🗡️',
        rarity: '에픽',
        stats: { hp: 0, attack: 25, defense: 0, speed: 0 },
        type: 'equipment',
        equipmentSlot: '무기',
    },
    excalibur: {
        id: 'excalibur',
        name: '엑스칼리버',
        emoji: '⚔️',
        rarity: '전설',
        stats: { hp: 0, attack: 40, defense: 0, speed: 5 },
        type: 'equipment',
        equipmentSlot: '무기',
    },

    // 방패
    wooden_shield: {
        id: 'wooden_shield',
        name: '나무 방패',
        emoji: '🪵',
        rarity: '일반',
        stats: { hp: 5, attack: 0, defense: 5, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
    iron_shield: {
        id: 'iron_shield',
        name: '철 방패',
        emoji: '🛡️',
        rarity: '고급',
        stats: { hp: 8, attack: 0, defense: 7, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
    guardian_shield: {
        id: 'guardian_shield',
        name: '수호자의 방패',
        emoji: '⚜️',
        rarity: '희귀',
        stats: { hp: 10, attack: 0, defense: 10, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
    holy_shield: {
        id: 'holy_shield',
        name: '성스러운 방패',
        emoji: '🔰',
        rarity: '에픽',
        stats: { hp: 15, attack: 0, defense: 12, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
    aegis_shield: {
        id: 'aegis_shield',
        name: '아이기스',
        emoji: '💠',
        rarity: '전설',
        stats: { hp: 20, attack: 0, defense: 18, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },

    // 목걸이
    wooden_pendant: {
        id: 'wooden_pendant',
        name: '나무 펜던트',
        emoji: '📿',
        rarity: '일반',
        stats: { hp: 3, attack: 1, defense: 1, speed: 1 },
        type: 'equipment',
        equipmentSlot: '목걸이',
    },
    silver_necklace: {
        id: 'silver_necklace',
        name: '은 목걸이',
        emoji: '📿',
        rarity: '고급',
        stats: { hp: 5, attack: 3, defense: 3, speed: 3 },
        type: 'equipment',
        equipmentSlot: '목걸이',
    },
    ruby_necklace: {
        id: 'ruby_necklace',
        name: '루비 목걸이',
        emoji: '📿',
        rarity: '희귀',
        stats: { hp: 8, attack: 5, defense: 5, speed: 5 },
        type: 'equipment',
        equipmentSlot: '목걸이',
    },
    diamond_necklace: {
        id: 'diamond_necklace',
        name: '다이아몬드 목걸이',
        emoji: '💎',
        rarity: '에픽',
        stats: { hp: 10, attack: 8, defense: 8, speed: 8 },
        type: 'equipment',
        equipmentSlot: '목걸이',
    },
    phoenix_heart: {
        id: 'phoenix_heart',
        name: '불사조의 심장',
        emoji: '❤️‍🔥',
        rarity: '전설',
        stats: { hp: 14, attack: 10, defense: 10, speed: 10 },
        type: 'equipment',
        equipmentSlot: '목걸이',
    },

    // 반지
    copper_ring: {
        id: 'copper_ring',
        name: '구리 반지',
        emoji: '⭕',
        rarity: '일반',
        stats: { hp: 2, attack: 1, defense: 1, speed: 1 },
        type: 'equipment',
        equipmentSlot: '반지',
    },
    silver_ring: {
        id: 'silver_ring',
        name: '은 반지',
        emoji: '💍',
        rarity: '고급',
        stats: { hp: 4, attack: 2, defense: 2, speed: 2 },
        type: 'equipment',
        equipmentSlot: '반지',
    },
    sapphire_ring: {
        id: 'sapphire_ring',
        name: '사파이어 반지',
        emoji: '💍',
        rarity: '희귀',
        stats: { hp: 6, attack: 4, defense: 4, speed: 4 },
        type: 'equipment',
        equipmentSlot: '반지',
    },
    emerald_ring: {
        id: 'emerald_ring',
        name: '에메랄드 반지',
        emoji: '💍',
        rarity: '에픽',
        stats: { hp: 8, attack: 6, defense: 6, speed: 6 },
        type: 'equipment',
        equipmentSlot: '반지',
    },
    infinity_ring: {
        id: 'infinity_ring',
        name: '무한의 반지',
        emoji: '💍',
        rarity: '전설',
        stats: { hp: 12, attack: 9, defense: 9, speed: 9 },
        type: 'equipment',
        equipmentSlot: '반지',
    },
};

export function loadInventory(): InventoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = getItem('inventory');
        if (!saved) return [];
        const items = JSON.parse(saved) as InventoryItem[];
        // 기존 데이터 마이그레이션: stats 없으면 기본값
        for (const entry of items) {
            if (!entry.stats) {
                entry.stats = { hp: 0, attack: 0, defense: 0, speed: 0 };
            }
            if (!entry.equipedItem) {
                entry.equipedItem = [];
            }
        }
        return items;
    } catch {
        return [];
    }
}

export function saveInventory(inventory: InventoryItem[]) {
    setItem('inventory', JSON.stringify(inventory));
}

export function addItemToInventory(itemId: string, quantity: number) {
    const item = GAME_ITEMS[itemId];
    if (!item) return;
    const inventory = loadInventory();
    const existing = inventory.find((i) => i.item.id === itemId);
    if (existing) {
        existing.quantity += quantity;
        if (!existing.equipedItem) {
            existing.equipedItem = [];
        }
    } else {
        inventory.push({ item, quantity, stats: { ...item.stats }, equipedItem: [] });
    }
    saveInventory(inventory);
}

export const PET_TYPES = [
    { key: 'dog' as const, label: '강아지' },
    { key: 'cat' as const, label: '고양이' },
    { key: 'bird' as const, label: '새' },
    { key: 'other' as const, label: '기타' },
];

export const PET_TRAITS = [
    '용감한', '호기심 많은', '장난꾸러기', '충성스러운',
    '독립적인', '활발한', '느긋한', '다정한',
    '영리한', '겁쟁이', '먹보', '고집쟁이', '수줍은',
] as const;

const ELEMENTS = ['불', '물', '풍', '땅'] as const;

const CLASS_MAP: Record<string, string> = {
    attack: '워리어',
    defense: '팔라딘',
    speed: '어쌔신',
};

const BASE_STATS: Record<PetInfo['type'], { hp: number; attack: number; defense: number; speed: number }> = {
    dog: { hp: 120, attack: 10, defense: 5, speed: 5 },
    cat: { hp: 100, attack: 10, defense: 0, speed: 10 },
    bird: { hp: 80, attack: 10, defense: 0, speed: 10 },
    other: { hp: 100, attack: 10, defense: 0, speed: 5 },
};

const TRAIT_MODIFIERS: Record<string, Partial<Record<'hp' | 'attack' | 'defense' | 'speed', number>>> = {
    '용감한': { attack: 3, hp: 10 },
    '호기심 많은': { speed: 3, attack: 2 },
    '장난꾸러기': { speed: 3, hp: 10 },
    '충성스러운': { defense: 3, hp: 10 },
    '독립적인': { attack: 3, speed: 2 },
    '활발한': { speed: 3, hp: 10 },
    '느긋한': { defense: 3, hp: 10 },
    '다정한': { hp: 10, defense: 2 },
    '영리한': { speed: 3, attack: 2 },
    '겁쟁이': { speed: 3, defense: 2 },
    '먹보': { hp: 10, defense: 2 },
    '고집쟁이': { defense: 3, attack: 2 },
    '수줍은': { defense: 3, speed: 2 },
};

export function generateCharacter(name: string, type: PetInfo['type'], traits: string[], image?: string): Character {
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
    hp += (nameHash % 10);
    attack += (nameHash % 5);
    defense += (nameHash % 5);
    speed += (nameHash % 5);

    const element = ELEMENTS[nameHash % ELEMENTS.length];

    // 가장 높은 스탯으로 직업 결정
    const statEntries = { attack, defense, speed };
    const topStat = (Object.entries(statEntries) as [string, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
    const className = CLASS_MAP[topStat];

    return {
        id: 'char-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name,
        className,
        hp,
        currentHp: hp,
        attack,
        defense,
        speed,
        element,
        level: 1,
        exp: 0,
        gold: 0,
        gem: 0,
        equipment: {
            투구: null,
            갑옷: null,
            망토: null,
            무기: null,
            방패: null,
            장갑: null,
            부츠: null,
            목걸이: null,
            반지: null,
        },
        ...(image ? { image } : {}),
    };
}

// === 장비 관리 함수 ===

/**
 * 장비를 장착합니다
 */
export function equipItem(itemId: string): { success: boolean; message: string } {
    const item = GAME_ITEMS[itemId];
    if (!item) return { success: false, message: '아이템을 찾을 수 없습니다.' };
    if (item.type !== 'equipment') return { success: false, message: '장비 아이템이 아닙니다.' };
    if (!item.equipmentSlot) return { success: false, message: '장착 부위가 없습니다.' };

    const character = loadCharacter();
    if (!character) return { success: false, message: '캐릭터를 찾을 수 없습니다.' };

    const inventory = loadInventory();
    const inventoryItem = inventory.find((i) => i.item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        return { success: false, message: '인벤토리에 해당 아이템이 없습니다.' };
    }

    const alreadyEquipped = Object.values(character.equipment).some((equipped) => equipped?.id === itemId);
    if (alreadyEquipped) {
        return { success: false, message: '이미 장착한 아이템입니다.' };
    }

    const slot = item.equipmentSlot;
    const currentEquipped = character.equipment[slot];

    // 기존 장비가 있으면 인벤토리로 반환
    if (currentEquipped) {
        let currentEntry = inventory.find((i) => i.item.id === currentEquipped.id);
        if (!currentEntry) {
            currentEntry = { item: currentEquipped, quantity: 0, stats: { ...currentEquipped.stats }, equipedItem: [] };
            inventory.push(currentEntry);
        }
        if (!currentEntry.equipedItem) {
            currentEntry.equipedItem = [];
        }
        const equippedIndex = currentEntry.equipedItem.findIndex((eq) => eq.id === currentEquipped.id);
        if (equippedIndex >= 0) {
            currentEntry.equipedItem.splice(equippedIndex, 1);
        }
        currentEntry.quantity += 1;
    }

    // 새 장비 장착
    character.equipment[slot] = item;

    // 인벤토리에서 제거 후 장착 목록에 추가
    if (!inventoryItem.equipedItem) {
        inventoryItem.equipedItem = [];
    }
    inventoryItem.equipedItem.push(item);
    inventoryItem.quantity -= 1;
    // 수량이 0이 되면 items에서 제거
    if (inventoryItem.quantity <= 0) {
        const index = inventory.indexOf(inventoryItem);
        inventory.splice(index, 1);
    }

    saveInventory(inventory);
    saveCharacter(character);

    return { success: true, message: `${item.name}을(를) 장착했습니다.` };
}

/**
 * 장비를 해제합니다
 */
export function unequipItem(slot: EquipmentSlot): { success: boolean; message: string } {
    const character = loadCharacter();
    if (!character) return { success: false, message: '캐릭터를 찾을 수 없습니다.' };

    const equippedItem = character.equipment[slot];
    if (!equippedItem) return { success: false, message: '장착된 장비가 없습니다.' };

    const inventory = loadInventory();
    let inventoryItem = inventory.find((i) => i.item.id === equippedItem.id);
    if (!inventoryItem) {
        // 인벤토리에 없으면 새로 추가
        inventoryItem = { item: equippedItem, quantity: 0, stats: { ...equippedItem.stats }, equipedItem: [] };
        inventory.push(inventoryItem);
    }
    if (!inventoryItem.equipedItem) {
        inventoryItem.equipedItem = [];
    }
    const equippedIndex = inventoryItem.equipedItem.findIndex((eq) => eq.id === equippedItem.id);
    if (equippedIndex >= 0) {
        inventoryItem.equipedItem.splice(equippedIndex, 1);
    }
    inventoryItem.quantity += 1;

    // 장비 해제
    character.equipment[slot] = null;

    saveInventory(inventory);
    saveCharacter(character);

    return { success: true, message: `${equippedItem.name}을(를) 해제했습니다.` };
}

/**
 * 장착중인 모든 장비의 스탯 합계를 계산합니다
 */
export function calculateEquipmentStats(character: Character): ItemStats {
    const totalStats: ItemStats = { hp: 0, attack: 0, defense: 0, speed: 0 };

    for (const slot of Object.keys(character.equipment) as EquipmentSlot[]) {
        const item = character.equipment[slot];
        if (item) {
            totalStats.hp += item.stats.hp;
            totalStats.attack += item.stats.attack;
            totalStats.defense += item.stats.defense;
            totalStats.speed += item.stats.speed;
        }
    }

    return totalStats;
}

/**
 * 장비 보너스를 포함한 캐릭터의 총 스탯을 계산합니다
 */
export function getTotalStats(character: Character): {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
} {
    const equipmentStats = calculateEquipmentStats(character);

    return {
        hp: character.hp + equipmentStats.hp,
        attack: character.attack + equipmentStats.attack,
        defense: character.defense + equipmentStats.defense,
        speed: character.speed + equipmentStats.speed,
    };
}

/**
 * 음식 아이템을 사용하여 HP를 회복합니다
 */
export function useFood(itemId: string): { success: boolean; message: string; itemName?: string; hpRecovered?: number } {
    const item = GAME_ITEMS[itemId];
    if (!item) return { success: false, message: '아이템을 찾을 수 없습니다.' };
    if (item.type !== 'food') return { success: false, message: '음식 아이템이 아닙니다.' };

    const character = loadCharacter();
    if (!character) return { success: false, message: '캐릭터를 찾을 수 없습니다.' };

    const inventory = loadInventory();
    const inventoryItem = inventory.find((i) => i.item.id === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        return { success: false, message: '인벤토리에 해당 아이템이 없습니다.' };
    }

    // HP가 이미 최대치인 경우
    const totalStats = getTotalStats(character);
    if (character.currentHp >= totalStats.hp) {
        return { success: false, message: 'HP가 이미 최대치입니다.' };
    }

    // HP 회복
    const hpToRecover = item.stats.hp;
    const oldHp = character.currentHp;
    character.currentHp = Math.min(character.currentHp + hpToRecover, totalStats.hp);
    const actualRecovered = character.currentHp - oldHp;

    // 인벤토리에서 제거
    inventoryItem.quantity -= 1;
    if (inventoryItem.quantity <= 0) {
        const index = inventory.indexOf(inventoryItem);
        inventory.splice(index, 1);
    }

    saveInventory(inventory);
    saveCharacter(character);

    return {
        success: true,
        message: '아이템 사용 성공',
        itemName: item.name,
        hpRecovered: actualRecovered
    };
}


