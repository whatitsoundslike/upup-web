// =============================================
// 아이템 제작 레시피 데이터
// =============================================

import { ItemRarity } from './itemData';

// === 타입 정의 ===
export interface CraftingMaterial {
    itemId: string;
    quantity: number;
}

export interface CraftingRecipe {
    id: string;
    resultItemId: string;
    resultQuantity: number;
    materials: CraftingMaterial[];
    successRate: number; // 0-100
    rarity: ItemRarity;
}

// === 제작 레시피 목록 ===
export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'craft_feed',
        resultItemId: 'feed',
        resultQuantity: 1,
        materials: [
            { itemId: 'faded_powder', quantity: 5 },
        ],
        successRate: 100,
        rarity: '일반',
    },
    {
        id: 'craft_armor_scroll',
        resultItemId: 'armor_enhance_scroll',
        resultQuantity: 1,
        materials: [
            { itemId: 'sparkling_powder', quantity: 20 },
        ],
        successRate: 100,
        rarity: '고급',
    },
    {
        id: 'craft_weapon_scroll',
        resultItemId: 'weapon_enhance_scroll',
        resultQuantity: 1,
        materials: [
            { itemId: 'shining_powder', quantity: 20 },
        ],
        successRate: 100,
        rarity: '희귀',
    },
    {
        id: 'craft_seven_star_sword',
        resultItemId: 'seven_star_sword',
        resultQuantity: 1,
        materials: [
            { itemId: 'faded_powder', quantity: 30 },
            { itemId: 'sparkling_powder', quantity: 20 },
            { itemId: 'shining_powder', quantity: 15 },
        ],
        successRate: 100,
        rarity: '에픽',
    },
    {
        id: 'craft_the_one_ring',
        resultItemId: 'the_one_ring',
        resultQuantity: 1,
        materials: [
            { itemId: 'sparkling_powder', quantity: 30 },
            { itemId: 'shining_powder', quantity: 30 },
            { itemId: 'brilliant_powder', quantity: 20 },
        ],
        successRate: 100,
        rarity: '전설',
    },
];

// === 헬퍼 함수 ===
export function getRecipeById(id: string): CraftingRecipe | undefined {
    return CRAFTING_RECIPES.find(r => r.id === id);
}
