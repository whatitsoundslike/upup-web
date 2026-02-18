import { getItem, setItem, removeItem } from './storage';

// 아이템 데이터 re-export (하위 호환성)
export {
    type EquipmentSlot,
    type ItemRarity,
    type ItemType,
    type EnhanceScrollType,
    type ItemStats,
    type GameItem,
    ITEM_RARITY_COLORS,
    ITEM_RARITY_BORDER,
    ITEM_RARITY_TEXT,
    ITEM_SELL_PRICE,
    RARITY_TO_POWDER,
    GAME_ITEMS,
    generateItemInstanceId,
} from './itemData';

import type { GameItem, ItemStats, ItemRarity, EquipmentSlot, EnhanceScrollType } from './itemData';
import { GAME_ITEMS, generateItemInstanceId } from './itemData';

// 장착된 장비 (아이템 + instanceId + 강화레벨)
export interface EquippedItem {
    item: GameItem;
    instanceId: string;
    enhanceLevel?: number;    // 강화 레벨 (0~10)
}

// 장착중인 장비
export interface EquippedItems {
    투구: EquippedItem | null;
    갑옷: EquippedItem | null;
    망토: EquippedItem | null;
    무기: EquippedItem | null;
    방패: EquippedItem | null;
    장갑: EquippedItem | null;
    부츠: EquippedItem | null;
    목걸이: EquippedItem | null;
    반지: EquippedItem | null;
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
    videoUrl?: string;
}

// 레벨별 필요 경험치 (3구간 설계)
// - 레벨 1~20: 선형 구간 (빠른 성장)
// - 레벨 21~50: 완만한 성장 구간
// - 레벨 51+: 지수적 성장 구간 (엔드게임)
export function getExpForNextLevel(level: number): number {
    if (level < 1) return 0;

    if (level <= 20) {
        // 선형 구간: 약 5~22전투/레벨
        return 100 + (level - 1) * 50;
    } else if (level <= 50) {
        // 완만 구간: 약 23~42전투/레벨 (레벨 20에서 연속)
        return Math.floor(4.95 * level * level + 211 * level - 1588);
    } else {
        // 지수 구간: 약 42~107전투/레벨 (레벨 50에서 연속)
        return Math.floor(21337 * Math.exp(0.021 * (level - 50)));
    }
}

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

// 장비 데이터 마이그레이션 (구버전: GameItem | null → 신버전: EquippedItem | null)
function migrateEquipmentData(char: Character): Character {
    const slots: EquipmentSlot[] = ['투구', '갑옷', '망토', '무기', '방패', '장갑', '부츠', '목걸이', '반지'];
    for (const slot of slots) {
        const equipped = char.equipment[slot];
        if (equipped && !('instanceId' in equipped)) {
            // 구버전 데이터: GameItem만 저장되어 있음 → EquippedItem으로 변환
            const oldItem = equipped as unknown as GameItem;
            char.equipment[slot] = {
                item: oldItem,
                instanceId: generateItemInstanceId(oldItem.id),
            };
        }
    }
    return char;
}

// 모든 캐릭터 로드
export function loadAllCharacters(): Character[] {
    try {
        const data = getItem('characters');
        if (!data) return [];
        const chars: Character[] = JSON.parse(data);
        // 장비 데이터 마이그레이션 적용
        let needsSave = false;
        for (const char of chars) {
            if (char.equipment) {
                const slots: EquipmentSlot[] = ['투구', '갑옷', '망토', '무기', '방패', '장갑', '부츠', '목걸이', '반지'];
                for (const slot of slots) {
                    const equipped = char.equipment[slot];
                    if (equipped && !('instanceId' in equipped)) {
                        needsSave = true;
                        migrateEquipmentData(char);
                        break;
                    }
                }
            }
        }
        if (needsSave) {
            saveAllCharacters(chars);
        }
        return chars;
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

    // 최초 캐릭터 생성 시 사료 10개 지급
    const isFirstCharacter = allChars.length === 0;

    allChars.push(character);
    saveAllCharacters(allChars);
    setActiveCharacter(character.id);

    if (isFirstCharacter) {
        addItemToInventory('feed', 10);
    }

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

        // 레벨업 시 스탯 증가 (클래스별 차등)
        character.hp += 10; // 공통

        switch (character.className) {
            case '워리어':
                character.attack += 2;
                character.defense += 1;
                character.speed += 1;
                break;
            case '팔라딘':
                character.attack += 1;
                character.defense += 2;
                character.speed += 1;
                break;
            case '어쌔신':
                character.attack += 1;
                character.defense += 1;
                character.speed += 2;
                break;
            default:
                character.attack += 1;
                character.defense += 1;
                character.speed += 1;
        }

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

export interface InventoryItem {
    item: GameItem;
    instanceId?: string;      // 장비 아이템의 고유 ID (거래용)
    enhanceLevel?: number;    // 강화 레벨 (0~10)
    equipedItem: GameItem[];
    quantity: number;
    stats: ItemStats;
}

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

// instanceId로 인벤토리 아이템 찾기 (거래용)
export function findInventoryItemByInstanceId(instanceId: string): InventoryItem | null {
    const inventory = loadInventory();
    return inventory.find((i) => i.instanceId === instanceId) || null;
}

// instanceId로 인벤토리에서 아이템 제거 (거래용)
export function removeInventoryItemByInstanceId(instanceId: string): InventoryItem | null {
    const inventory = loadInventory();
    const index = inventory.findIndex((i) => i.instanceId === instanceId);
    if (index < 0) return null;
    const [removed] = inventory.splice(index, 1);
    saveInventory(inventory);
    return removed;
}

// 특정 InventoryItem을 그대로 인벤토리에 추가 (거래용 - instanceId 유지)
export function addInventoryItemDirect(invItem: InventoryItem) {
    const inventory = loadInventory();
    inventory.push(invItem);
    saveInventory(inventory);
}

export function addItemToInventory(itemId: string, quantity: number) {
    const item = GAME_ITEMS[itemId];
    if (!item) return;
    const inventory = loadInventory();

    // equipment 타입은 각각 별도 엔트리로 저장 (스택 안함) + 고유 instanceId 부여
    if (item.type === 'equipment') {
        for (let i = 0; i < quantity; i++) {
            inventory.push({
                item,
                instanceId: generateItemInstanceId(itemId),
                quantity: 1,
                stats: { ...item.stats },
                equipedItem: []
            });
        }
    } else {
        // 일반 아이템은 스택
        const existing = inventory.find((i) => i.item.id === itemId);
        if (existing) {
            existing.quantity += quantity;
            if (!existing.equipedItem) {
                existing.equipedItem = [];
            }
        } else {
            inventory.push({ item, quantity, stats: { ...item.stats }, equipedItem: [] });
        }
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

// 직업 타입
export type CharacterClass = '워리어' | '팔라딘' | '어쌔신';

// 직업 목록
export const CHARACTER_CLASSES: { key: CharacterClass; label: string; description: string; icon: string }[] = [
    { key: '워리어', label: '워리어', description: '공격력 특화', icon: '⚔️' },
    { key: '팔라딘', label: '팔라딘', description: '방어력 특화', icon: '🛡️' },
    { key: '어쌔신', label: '어쌔신', description: '속도 특화', icon: '🗡️' },
];

export function generateCharacter(name: string, type: PetInfo['type'], traits: string[], className: CharacterClass, image?: string): Character {
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

    const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];

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
    const inventoryIndex = inventory.findIndex((i) => i.item.id === itemId && i.quantity > 0);
    if (inventoryIndex < 0) {
        return { success: false, message: '인벤토리에 해당 아이템이 없습니다.' };
    }
    const inventoryItem = inventory[inventoryIndex];

    const slot = item.equipmentSlot;
    const currentEquipped = character.equipment[slot];

    // 기존 장비가 있으면 인벤토리로 반환 (기존 instanceId, enhanceLevel 유지)
    if (currentEquipped) {
        const enhanceLevel = currentEquipped.enhanceLevel ?? 0;
        const currentSlot = currentEquipped.item.equipmentSlot;
        inventory.push({
            item: currentEquipped.item,
            instanceId: currentEquipped.instanceId,
            enhanceLevel: enhanceLevel > 0 ? enhanceLevel : undefined,
            quantity: 1,
            stats: enhanceLevel > 0 ? getEnhancedStats(currentEquipped.item.stats, enhanceLevel, currentSlot, currentEquipped.item.rarity) : { ...currentEquipped.item.stats },
            equipedItem: []
        });
    }

    // 새 장비 장착 (인벤토리 아이템의 instanceId, enhanceLevel 유지)
    character.equipment[slot] = {
        item: inventoryItem.item,
        instanceId: inventoryItem.instanceId || generateItemInstanceId(item.id),
        enhanceLevel: inventoryItem.enhanceLevel,
    };

    // 인벤토리에서 제거 (equipment는 quantity가 항상 1이므로 엔트리 자체를 제거)
    inventory.splice(inventoryIndex, 1);

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

    const equipped = character.equipment[slot];
    if (!equipped) return { success: false, message: '장착된 장비가 없습니다.' };

    const inventory = loadInventory();

    // 인벤토리에 추가 (기존 instanceId, enhanceLevel 유지)
    const enhanceLevel = equipped.enhanceLevel ?? 0;
    inventory.push({
        item: equipped.item,
        instanceId: equipped.instanceId,
        enhanceLevel: enhanceLevel > 0 ? enhanceLevel : undefined,
        quantity: 1,
        stats: enhanceLevel > 0 ? getEnhancedStats(equipped.item.stats, enhanceLevel, slot, equipped.item.rarity) : { ...equipped.item.stats },
        equipedItem: []
    });

    // 장비 해제
    character.equipment[slot] = null;

    saveInventory(inventory);
    saveCharacter(character);

    return { success: true, message: `${equipped.item.name}을(를) 해제했습니다.` };
}

/**
 * 장착중인 모든 장비의 스탯 합계를 계산합니다
 */
export function calculateEquipmentStats(character: Character): ItemStats {
    const totalStats: ItemStats = { hp: 0, attack: 0, defense: 0, speed: 0 };

    for (const slot of Object.keys(character.equipment) as EquipmentSlot[]) {
        const equipped = character.equipment[slot];
        if (equipped) {
            // 강화 보너스 포함 스탯 계산
            const enhanceLevel = equipped.enhanceLevel ?? 0;
            const enhancedStats = enhanceLevel > 0
                ? getEnhancedStats(equipped.item.stats, enhanceLevel, slot, equipped.item.rarity)
                : equipped.item.stats;

            totalStats.hp += enhancedStats.hp;
            totalStats.attack += enhancedStats.attack;
            totalStats.defense += enhancedStats.defense;
            totalStats.speed += enhancedStats.speed;
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

// === 강화 시스템 ===

// 장비 부위별 필요한 강화 주문서 타입
export function getRequiredScrollType(slot: EquipmentSlot): EnhanceScrollType {
    switch (slot) {
        case '무기':
            return 'weapon';
        case '투구':
        case '갑옷':
        case '장갑':
        case '부츠':
        case '망토':
        case '방패':
            return 'armor';
        case '목걸이':
        case '반지':
            return 'accessory';
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

// 강화 레벨별 스탯 보너스 계산
// - 무기: 등급별 공격력 차등 상승
// - 방어구: 방어력 +1 (등급 무관)
// - 악세사리: 체력 +30, 속도 +1 (등급 무관)
export function getEnhancementBonus(baseStats: ItemStats, enhanceLevel: number, slot?: EquipmentSlot, rarity?: ItemRarity): ItemStats {
    if (!slot || !rarity || enhanceLevel <= 0) {
        return { hp: 0, attack: 0, defense: 0, speed: 0 };
    }

    const scrollType = getRequiredScrollType(slot);

    switch (scrollType) {
        case 'weapon':
            // 무기: 등급별 공격력 차등
            return {
                hp: 0,
                attack: WEAPON_ENHANCE_ATTACK[rarity] * enhanceLevel,
                defense: 0,
                speed: 0,
            };
        case 'armor':
            // 방어구: 방어력 +1 per level
            return {
                hp: 0,
                attack: 0,
                defense: 1 * enhanceLevel,
                speed: 0,
            };
        case 'accessory':
            // 악세사리: 체력 +30, 속도 +1 per level
            return {
                hp: 30 * enhanceLevel,
                attack: 0,
                defense: 0,
                speed: 1 * enhanceLevel,
            };
    }
}

// 강화된 총 스탯 계산
export function getEnhancedStats(baseStats: ItemStats, enhanceLevel: number, slot?: EquipmentSlot, rarity?: ItemRarity): ItemStats {
    const bonus = getEnhancementBonus(baseStats, enhanceLevel, slot, rarity);
    return {
        hp: baseStats.hp + bonus.hp,
        attack: baseStats.attack + bonus.attack,
        defense: baseStats.defense + bonus.defense,
        speed: baseStats.speed + bonus.speed,
    };
}

// 강화 성공 확률 (레벨별 차등)
// 1~6: 100%, 7~10: 70%, 11~20: 65%, 21~30: 40%
export function getEnhanceSuccessRate(currentLevel: number): number {
    const targetLevel = currentLevel + 1;
    if (targetLevel <= 6) return 1.0;
    if (targetLevel <= 10) return 0.7;
    if (targetLevel <= 20) return 0.65;
    return 0.4;
}

// 천장 레벨 (실패해도 강화수치 하락 없음)
export const CEILING_LEVELS = [10, 15, 20, 25];

// 최대 강화 레벨
export const MAX_ENHANCE_LEVEL = 30;

// 강화 시도 결과 타입
export interface EnhanceResult {
    success: boolean;
    message: string;
    newLevel?: number;
    isMaxLevel?: boolean;
}

/**
 * 장비 강화를 시도합니다
 * @param instanceId 강화할 장비의 instanceId
 * @param scrollId 사용할 강화 주문서의 아이템 ID
 */
export function enhanceEquipment(instanceId: string, scrollId: string): EnhanceResult {
    const scroll = GAME_ITEMS[scrollId];
    if (!scroll || scroll.type !== 'scroll') {
        return { success: false, message: '유효한 강화 주문서가 아닙니다.' };
    }

    const inventory = loadInventory();

    // 주문서 보유 확인
    const scrollEntry = inventory.find((i) => i.item.id === scrollId && i.quantity > 0);
    if (!scrollEntry) {
        return { success: false, message: '강화 주문서가 부족합니다.' };
    }

    // 강화할 장비 찾기
    const equipmentIndex = inventory.findIndex((i) => i.instanceId === instanceId);
    if (equipmentIndex < 0) {
        return { success: false, message: '장비를 찾을 수 없습니다.' };
    }
    const equipment = inventory[equipmentIndex];

    if (equipment.item.type !== 'equipment' || !equipment.item.equipmentSlot) {
        return { success: false, message: '강화할 수 없는 아이템입니다.' };
    }

    // 주문서 타입 검증
    const requiredScrollType = getRequiredScrollType(equipment.item.equipmentSlot);
    if (scroll.enhanceScrollType !== requiredScrollType) {
        const scrollNames: Record<EnhanceScrollType, string> = {
            weapon: '무기 강화 주문서',
            armor: '방어구 강화 주문서',
            accessory: '악세사리 강화 주문서',
        };
        return { success: false, message: `이 장비에는 ${scrollNames[requiredScrollType]}가 필요합니다.` };
    }

    // 최대 레벨 검사
    const currentLevel = equipment.enhanceLevel ?? 0;
    if (currentLevel >= MAX_ENHANCE_LEVEL) {
        return { success: false, message: '이미 최대 강화 레벨입니다.', isMaxLevel: true };
    }

    // 주문서 소모
    scrollEntry.quantity -= 1;
    if (scrollEntry.quantity <= 0) {
        const scrollIndex = inventory.indexOf(scrollEntry);
        inventory.splice(scrollIndex, 1);
    }

    // 강화 확률 판정 (레벨별 차등)
    const successRate = getEnhanceSuccessRate(currentLevel);
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
        // 강화 성공: 레벨 증가 및 스탯 갱신
        const newLevel = currentLevel + 1;
        equipment.enhanceLevel = newLevel;
        equipment.stats = getEnhancedStats(equipment.item.stats, newLevel, equipment.item.equipmentSlot, equipment.item.rarity);

        saveInventory(inventory);
        return {
            success: true,
            message: `강화 성공! +${newLevel}`,
            newLevel,
            isMaxLevel: newLevel >= MAX_ENHANCE_LEVEL,
        };
    } else {
        // 강화 실패: 천장 레벨이 아니면 -1
        const isCeilingLevel = CEILING_LEVELS.includes(currentLevel);
        const newLevel = isCeilingLevel ? currentLevel : Math.max(0, currentLevel - 1);
        equipment.enhanceLevel = newLevel;
        equipment.stats = getEnhancedStats(equipment.item.stats, newLevel, equipment.item.equipmentSlot, equipment.item.rarity);

        saveInventory(inventory);
        return {
            success: false,
            message: isCeilingLevel ? '강화에 실패했습니다... (천장 보호)' : `강화에 실패했습니다... (+${currentLevel} → +${newLevel})`,
            newLevel,
        };
    }
}

/**
 * 장착중인 장비를 강화합니다
 */
export function enhanceEquippedItem(slot: EquipmentSlot, scrollId: string): EnhanceResult {
    const scroll = GAME_ITEMS[scrollId];
    if (!scroll || scroll.type !== 'scroll') {
        return { success: false, message: '유효한 강화 주문서가 아닙니다.' };
    }

    const character = loadCharacter();
    if (!character) {
        return { success: false, message: '캐릭터를 찾을 수 없습니다.' };
    }

    const equipped = character.equipment[slot];
    if (!equipped) {
        return { success: false, message: '장착된 장비가 없습니다.' };
    }

    const inventory = loadInventory();

    // 주문서 보유 확인
    const scrollEntry = inventory.find((i) => i.item.id === scrollId && i.quantity > 0);
    if (!scrollEntry) {
        return { success: false, message: '강화 주문서가 부족합니다.' };
    }

    // 주문서 타입 검증
    const requiredScrollType = getRequiredScrollType(slot);
    if (scroll.enhanceScrollType !== requiredScrollType) {
        const scrollNames: Record<EnhanceScrollType, string> = {
            weapon: '무기 강화 주문서',
            armor: '방어구 강화 주문서',
            accessory: '악세사리 강화 주문서',
        };
        return { success: false, message: `이 장비에는 ${scrollNames[requiredScrollType]}가 필요합니다.` };
    }

    // 최대 레벨 검사
    const currentLevel = equipped.enhanceLevel ?? 0;
    if (currentLevel >= MAX_ENHANCE_LEVEL) {
        return { success: false, message: '이미 최대 강화 레벨입니다.', isMaxLevel: true };
    }

    // 주문서 소모
    scrollEntry.quantity -= 1;
    if (scrollEntry.quantity <= 0) {
        const scrollIndex = inventory.indexOf(scrollEntry);
        inventory.splice(scrollIndex, 1);
    }

    // 강화 확률 판정 (레벨별 차등)
    const successRate = getEnhanceSuccessRate(currentLevel);
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
        // 강화 성공
        const newLevel = currentLevel + 1;
        equipped.enhanceLevel = newLevel;

        saveInventory(inventory);
        saveCharacter(character);
        return {
            success: true,
            message: `강화 성공! +${newLevel}`,
            newLevel,
            isMaxLevel: newLevel >= MAX_ENHANCE_LEVEL,
        };
    } else {
        // 강화 실패: 천장 레벨이 아니면 -1
        const isCeilingLevel = CEILING_LEVELS.includes(currentLevel);
        const newLevel = isCeilingLevel ? currentLevel : Math.max(0, currentLevel - 1);
        equipped.enhanceLevel = newLevel;

        saveInventory(inventory);
        saveCharacter(character);
        return {
            success: false,
            message: isCeilingLevel ? '강화에 실패했습니다... (천장 보호)' : `강화에 실패했습니다... (+${currentLevel} → +${newLevel})`,
            newLevel,
        };
    }
}
