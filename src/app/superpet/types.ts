// 장착 부위 타입
export type EquipmentSlot = '투구' | '갑옷' | '장갑' | '부츠' | '망토' | '무기' | '방패' | '악세사리1' | '악세사리2';

// 장착중인 장비
export interface EquippedItems {
    투구: GameItem | null;
    갑옷: GameItem | null;
    망토: GameItem | null;
    무기: GameItem | null;
    방패: GameItem | null;
    장갑: GameItem | null;
    부츠: GameItem | null;
    악세사리1: GameItem | null;
    악세사리2: GameItem | null;
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
    const saved = localStorage.getItem('superpet-character');
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
                악세사리1: null,
                악세사리2: null,
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
            localStorage.removeItem('superpet-character'); // Remove old single character data
        }
    }
}

export function loadCharacter(): Character | null {
    try {
        const activeId = localStorage.getItem('superpet-active-character');
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
        const data = localStorage.getItem('superpet-characters');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// 모든 캐릭터 저장
export function saveAllCharacters(characters: Character[]) {
    localStorage.setItem('superpet-characters', JSON.stringify(characters));
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
    const activeId = localStorage.getItem('superpet-active-character');
    if (activeId === characterId) {
        if (filtered.length > 0) {
            setActiveCharacter(filtered[0].id);
        } else {
            localStorage.removeItem('superpet-active-character');
        }
    }
}

// 활성 캐릭터 설정
export function setActiveCharacter(characterId: string) {
    localStorage.setItem('superpet-active-character', characterId);
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

        // 레벨업 시 체력 완전 회복
        character.currentHp = character.hp;

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
    description: string;
    stats: ItemStats;
    type: ItemType;
    equipmentSlot?: EquipmentSlot; // equipment 타입일 경우 장착 부위
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
    potion: {
        id: 'potion',
        name: '회복 포션',
        emoji: '🧪',
        rarity: '일반',
        description: '체력을 회복시켜주는 기본 포션.',
        stats: { hp: 10, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    // 고급 - 음식
    enhanced_feed: {
        id: 'enhanced_feed',
        name: '강화 사료',
        emoji: '🥩',
        rarity: '고급',
        description: '영양이 풍부한 특제 사료. 체력을 회복한다.',
        stats: { hp: 15, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    // 희귀 - 음식
    magic_snack: {
        id: 'magic_snack',
        name: '마법 간식',
        emoji: '✨',
        rarity: '희귀',
        description: '마법이 깃든 특별한 간식. 먹으면 체력이 회복된다.',
        stats: { hp: 25, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    starlight_armor: {
        id: 'starlight_armor',
        name: '별빛 갑옷',
        emoji: '🌟',
        rarity: '에픽',
        description: '별의 축복을 받은 갑옷. 튼튼하면서도 가볍다.',
        stats: { hp: 10, attack: 0, defense: 13, speed: 0 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    // 전설 - 음식
    legend_food: {
        id: 'legend_food',
        name: '전설의 요리',
        emoji: '🍖',
        rarity: '전설',
        description: '전설의 요리사가 만든 최고급 요리. 엄청난 체력을 회복한다.',
        stats: { hp: 60, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },

    // 전설 - 장비 (악세사리)
    legend_necklace: {
        id: 'legend_necklace',
        name: '전설의 목걸이',
        emoji: '📿',
        rarity: '전설',
        description: '드래곤의 비늘로 만든 전설적인 목걸이.',
        stats: { hp: 14, attack: 10, defense: 10, speed: 10 },
        type: 'equipment',
        equipmentSlot: '악세사리1',
    },

    // === 장비 아이템 ===
    // 투구
    iron_helmet: {
        id: 'iron_helmet',
        name: '철제 투구',
        emoji: '⛑️',
        rarity: '일반',
        description: '기본적인 철제 투구. 머리를 보호한다.',
        stats: { hp: 5, attack: 0, defense: 3, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },
    knight_helmet: {
        id: 'knight_helmet',
        name: '기사의 투구',
        emoji: '🪖',
        rarity: '희귀',
        description: '용맹한 기사가 착용하던 투구.',
        stats: { hp: 10, attack: 0, defense: 8, speed: 0 },
        type: 'equipment',
        equipmentSlot: '투구',
    },

    // 갑옷
    leather_armor: {
        id: 'leather_armor',
        name: '가죽 갑옷',
        emoji: '🦺',
        rarity: '일반',
        description: '가벼운 가죽으로 만든 갑옷.',
        stats: { hp: 8, attack: 0, defense: 5, speed: 2 },
        type: 'equipment',
        equipmentSlot: '갑옷',
    },
    dragon_armor: {
        id: 'dragon_armor',
        name: '드래곤 갑옷',
        emoji: '🛡️',
        rarity: '전설',
        description: '드래곤의 비늘로 만든 최강의 갑옷.',
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
        description: '부드러운 천으로 만든 장갑.',
        stats: { hp: 0, attack: 2, defense: 1, speed: 1 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },
    power_gloves: {
        id: 'power_gloves',
        name: '힘의 장갑',
        emoji: '🥊',
        rarity: '에픽',
        description: '착용자의 힘을 증폭시키는 마법 장갑.',
        stats: { hp: 0, attack: 12, defense: 3, speed: 0 },
        type: 'equipment',
        equipmentSlot: '장갑',
    },

    // 부츠
    running_shoes: {
        id: 'running_shoes',
        name: '러닝화',
        emoji: '👟',
        rarity: '일반',
        description: '가볍고 빠른 신발.',
        stats: { hp: 0, attack: 0, defense: 0, speed: 5 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },
    wind_boots: {
        id: 'wind_boots',
        name: '바람의 부츠',
        emoji: '🥾',
        rarity: '희귀',
        description: '바람의 정령이 깃든 부츠. 발걸음이 가벼워진다.',
        stats: { hp: 5, attack: 0, defense: 3, speed: 10 },
        type: 'equipment',
        equipmentSlot: '부츠',
    },

    // 망토
    simple_cloak: {
        id: 'simple_cloak',
        name: '간단한 망토',
        emoji: '🧥',
        rarity: '일반',
        description: '평범한 천으로 만든 망토.',
        stats: { hp: 3, attack: 0, defense: 2, speed: 0 },
        type: 'equipment',
        equipmentSlot: '망토',
    },
    shadow_cloak: {
        id: 'shadow_cloak',
        name: '그림자 망토',
        emoji: '🦇',
        rarity: '에픽',
        description: '어둠 속에서 빛나는 신비한 망토.',
        stats: { hp: 8, attack: 5, defense: 8, speed: 8 },
        type: 'equipment',
        equipmentSlot: '망토',
    },

    // 무기
    wooden_sword: {
        id: 'wooden_sword',
        name: '나무 검',
        emoji: '🗡️',
        rarity: '일반',
        description: '훈련용 나무 검.',
        stats: { hp: 0, attack: 5, defense: 0, speed: 0 },
        type: 'equipment',
        equipmentSlot: '무기',
    },
    flame_sword: {
        id: 'flame_sword',
        name: '화염의 검',
        emoji: '⚔️',
        rarity: '전설',
        description: '불꽃이 타오르는 전설의 검.',
        stats: { hp: 0, attack: 20, defense: 0, speed: 5 },
        type: 'equipment',
        equipmentSlot: '무기',
    },

    // 방패
    wooden_shield: {
        id: 'wooden_shield',
        name: '나무 방패',
        emoji: '🛡️',
        rarity: '일반',
        description: '기본적인 나무 방패.',
        stats: { hp: 5, attack: 0, defense: 5, speed: -2 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
    holy_shield: {
        id: 'holy_shield',
        name: '성스러운 방패',
        emoji: '🔰',
        rarity: '에픽',
        description: '신성한 힘이 깃든 방패.',
        stats: { hp: 15, attack: 0, defense: 12, speed: 0 },
        type: 'equipment',
        equipmentSlot: '방패',
    },
};

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
    localStorage.setItem('superpet-inventory', JSON.stringify(inventory));
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
    dog: { hp: 120, attack: 25, defense: 30, speed: 20 },
    cat: { hp: 90, attack: 35, defense: 15, speed: 40 },
    other: { hp: 100, attack: 30, defense: 25, speed: 25 },
};

const TRAIT_MODIFIERS: Record<string, Partial<Record<'hp' | 'attack' | 'defense' | 'speed', number>>> = {
    '용감한': { attack: 10, hp: 10 },
    '호기심 많은': { speed: 10, attack: 5 },
    '장난꾸러기': { speed: 15, defense: -5 },
    '충성스러운': { defense: 15, hp: 10 },
    '독립적인': { attack: 10, speed: 5 },
    '활발한': { speed: 10, hp: 5 },
    '느긋한': { defense: 15, hp: 15 },
    '다정한': { hp: 20, defense: 5 },
    '영리한': { speed: 8, attack: 8 },
    '겁쟁이': { speed: 20, attack: -5 },
    '먹보': { hp: 25, speed: -5 },
    '고집쟁이': { defense: 10, attack: 5 },
    '수줍은': { defense: 8, speed: 8 },
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
            악세사리1: null,
            악세사리2: null,
        },
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
export function useFood(itemId: string): { success: boolean; message: string; hpRecovered?: number } {
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
        message: `${item.name}을(를) 사용하여 HP ${actualRecovered} 회복했습니다!`,
        hpRecovered: actualRecovered
    };
}


