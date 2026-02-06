// =============================================
// 아이템 데이터 통합 관리
// 아이템 추가/수정 시 이 파일만 수정하면 됩니다.
// =============================================

// === 타입 정의 ===
export type EquipmentSlot = '투구' | '갑옷' | '장갑' | '부츠' | '망토' | '무기' | '방패' | '목걸이' | '반지';

export type ItemRarity = '일반' | '고급' | '희귀' | '에픽' | '전설';

export type ItemType = 'equipment' | 'food' | 'scroll' | 'currency';

export type EnhanceScrollType = 'weapon' | 'armor' | 'accessory';

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
    enhanceScrollType?: EnhanceScrollType; // scroll 타입일 경우 강화 대상
    shopGoldPrice?: number; // 골드 상점 구매가
    shopGemPrice?: number; // 젬 상점 구매가
    goldAmount?: number; // currency 타입일 경우 획득 골드량
}

// === 희귀도별 스타일 ===
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

export const ITEM_RARITY_TEXT: Record<ItemRarity, string> = {
    '일반': 'text-zinc-500',
    '고급': 'text-green-500',
    '희귀': 'text-blue-500',
    '에픽': 'text-purple-500',
    '전설': 'text-amber-500',
};

export const ITEM_SELL_PRICE: Record<ItemRarity, number> = {
    '일반': 10,
    '고급': 30,
    '희귀': 80,
    '에픽': 200,
    '전설': 500,
};

// === 장비 아이템 고유 ID 생성 ===
export function generateItemInstanceId(itemId: string): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${itemId}-${crypto.randomUUID()}`;
    }
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 10);
    const random2 = Math.random().toString(36).substring(2, 10);
    return `${itemId}-${timestamp}-${random1}${random2}`;
}

// === 아이템 데이터 ===
export const GAME_ITEMS: Record<string, GameItem> = {
    // ========== 음식 아이템 ==========
    feed: {
        id: 'feed',
        name: '사료',
        emoji: '🥫',
        rarity: '일반',
        stats: { hp: 50, attack: 0, defense: 0, speed: 0 },
        type: 'food',
        shopGoldPrice: 50,
    },
    dubai_cookie: {
        id: 'dubai_cookie',
        name: '두바이 쫀득 쿠키',
        emoji: '🍪',
        rarity: '고급',
        stats: { hp: 100, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    meat: {
        id: 'meat',
        name: '고기',
        emoji: '🥩',
        rarity: '희귀',
        stats: { hp: 200, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },
    legend_meat: {
        id: 'legend_meat',
        name: '전설의 고기',
        emoji: '🍖',
        rarity: '전설',
        stats: { hp: 1000, attack: 0, defense: 0, speed: 0 },
        type: 'food',
    },

    // ========== 장비 - 투구 ==========
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

    // ========== 장비 - 갑옷 ==========
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

    // ========== 장비 - 장갑 ==========
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

    // ========== 장비 - 부츠 ==========
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

    // ========== 장비 - 망토 ==========
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

    // ========== 장비 - 무기 ==========
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

    // ========== 장비 - 방패 ==========
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

    // ========== 장비 - 목걸이 ==========
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

    // ========== 장비 - 반지 ==========
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

    // ========== 강화 주문서 ==========
    weapon_enhance_scroll: {
        id: 'weapon_enhance_scroll',
        name: '무기 강화 주문서',
        emoji: '📜',
        rarity: '희귀',
        stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
        type: 'scroll',
        enhanceScrollType: 'weapon',
        shopGoldPrice: 6000,
    },
    armor_enhance_scroll: {
        id: 'armor_enhance_scroll',
        name: '방어구 강화 주문서',
        emoji: '📜',
        rarity: '고급',
        stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
        type: 'scroll',
        enhanceScrollType: 'armor',
        shopGoldPrice: 3000,
    },
    accessory_enhance_scroll: {
        id: 'accessory_enhance_scroll',
        name: '장신구 강화 주문서',
        emoji: '📜',
        rarity: '에픽',
        stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
        type: 'scroll',
        enhanceScrollType: 'accessory',
        shopGoldPrice: 10000,
    },

    // ========== 재화 아이템 ==========
    gold_pack: {
        id: 'gold_pack',
        name: '골드 주머니',
        emoji: '💰',
        rarity: '에픽',
        stats: { hp: 0, attack: 0, defense: 0, speed: 0 },
        type: 'currency',
        shopGemPrice: 50,
        goldAmount: 20000,
    },
};
