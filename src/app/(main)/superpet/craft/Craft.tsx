'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Hammer, X, AlertCircle, Check, Heart, Zap, Shield, Gauge } from 'lucide-react';
import Link from 'next/link';
import { CRAFTING_RECIPES, type CraftingRecipe } from '../craftingData';
import { GAME_ITEMS, ITEM_RARITY_COLORS, ITEM_RARITY_TEXT } from '../itemData';
import { loadInventory, saveInventory, addItemToInventory, type InventoryItem } from '../types';
import CraftingModal, { type CraftingResult } from '../components/CraftingModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useDebouncedSave } from '../gameSync';

export default function Craft() {
    const { t, lang } = useLanguage();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
    const [craftingModal, setCraftingModal] = useState<{
        isOpen: boolean;
        recipe: CraftingRecipe | null;
    }>({ isOpen: false, recipe: null });
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const debouncedSaveToServer = useDebouncedSave();

    useEffect(() => {
        setInventory(loadInventory());
    }, []);

    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => setActiveToast(null), 2400);
        return () => clearTimeout(timer);
    }, [activeToast]);

    const showToast = (message: string, tone: 'success' | 'error') => {
        setActiveToast({ message, tone, key: Date.now() });
    };

    // 인벤토리에서 특정 아이템의 수량 확인
    const getItemCount = (itemId: string): number => {
        const entry = inventory.find(e => e.item.id === itemId);
        return entry?.quantity ?? 0;
    };

    // 레시피의 재료가 충분한지 확인
    const canCraft = (recipe: CraftingRecipe): boolean => {
        return recipe.materials.every(mat => getItemCount(mat.itemId) >= mat.quantity);
    };

    // 재료 소모
    const consumeMaterials = (recipe: CraftingRecipe) => {
        let updated = [...inventory];

        for (const mat of recipe.materials) {
            updated = updated.map(entry => {
                if (entry.item.id === mat.itemId) {
                    return { ...entry, quantity: entry.quantity - mat.quantity };
                }
                return entry;
            }).filter(entry => entry.quantity > 0);
        }

        setInventory(updated);
        saveInventory(updated);
    };

    // 제작 시작
    const handleStartCraft = (recipe: CraftingRecipe) => {
        if (!canCraft(recipe)) return;

        // 재료 소모
        consumeMaterials(recipe);

        // 모달 열기
        setCraftingModal({ isOpen: true, recipe });
        setSelectedRecipe(null);
    };

    // 제작 완료
    const handleCraftComplete = (result: CraftingResult) => {
        if (result.success) {
            // 결과 아이템 추가
            addItemToInventory(result.itemId, result.quantity);
            setInventory(loadInventory());

            const resultItem = GAME_ITEMS[result.itemId];
            showToast(
                lang === 'ko'
                    ? `${resultItem?.name ?? result.itemId} ${result.quantity}개 제작 성공!`
                    : `Crafted ${result.quantity}x ${t(resultItem?.name ?? result.itemId)}!`,
                'success'
            );
        } else {
            showToast(
                lang === 'ko'
                    ? '제작에 실패했습니다. 재료가 소모되었습니다.'
                    : 'Crafting failed. Materials have been consumed.',
                'error'
            );
        }

        debouncedSaveToServer();
        setCraftingModal({ isOpen: false, recipe: null });
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-2 lg:p-12 min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-white p-4">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/superpet/room" className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-2">
                    <Hammer className="w-6 h-6 text-purple-400" />
                    <h1 className="text-xl font-bold">{lang === 'ko' ? '아이템 제작' : 'Item Crafting'}</h1>
                </div>
            </div>

            {/* 레시피 목록 */}
            <div className="grid gap-3">
                {CRAFTING_RECIPES.map(recipe => {
                    const resultItem = GAME_ITEMS[recipe.resultItemId];
                    const hasMaterials = canCraft(recipe);

                    return (
                        <motion.button
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-4 rounded-xl border ${ITEM_RARITY_COLORS[recipe.rarity]} transition-all`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{resultItem?.emoji}</span>
                                    <div className="text-left">
                                        <p className="font-bold">{t(resultItem?.name ?? recipe.resultItemId)}</p>
                                        <p className={`text-sm ${ITEM_RARITY_TEXT[recipe.rarity]}`}>
                                            {t(recipe.rarity)} | {lang === 'ko' ? '성공률' : 'Rate'} {recipe.successRate}%
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${hasMaterials ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {hasMaterials ? (lang === 'ko' ? '제작 가능' : 'Available') : (lang === 'ko' ? '재료 부족' : 'Insufficient')}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* 레시피 상세 모달 */}
            <AnimatePresence>
                {selectedRecipe && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-end justify-center bg-black/60"
                        onClick={() => setSelectedRecipe(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-zinc-900 rounded-t-3xl p-6 pb-8"
                        >
                            {/* 닫기 버튼 */}
                            <button
                                onClick={() => setSelectedRecipe(null)}
                                className="absolute right-4 top-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* 결과 아이템 */}
                            <div className="flex flex-col items-center mb-6">
                                <span className="text-6xl mb-3">{GAME_ITEMS[selectedRecipe.resultItemId]?.emoji}</span>
                                <h3 className="text-xl font-bold mb-1">
                                    {t(GAME_ITEMS[selectedRecipe.resultItemId]?.name ?? selectedRecipe.resultItemId)}
                                </h3>
                                <p className={`text-sm ${ITEM_RARITY_TEXT[selectedRecipe.rarity]}`}>
                                    {t(selectedRecipe.rarity)} | {lang === 'ko' ? '성공률' : 'Success Rate'} {selectedRecipe.successRate}%
                                </p>
                            </div>

                            {/* 장비 스탯 정보 */}
                            {(() => {
                                const resultItem = GAME_ITEMS[selectedRecipe.resultItemId];
                                if (resultItem?.type !== 'equipment') return null;
                                const stats = resultItem.stats;
                                const hasStats = stats.hp > 0 || stats.attack > 0 || stats.defense > 0 || stats.speed > 0;
                                if (!hasStats) return null;

                                return (
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        {stats.hp > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-sm">
                                                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                                                <span className="text-zinc-400">HP</span>
                                                <span className="ml-auto font-bold text-red-500">+{stats.hp}</span>
                                            </div>
                                        )}
                                        {stats.attack > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 text-sm">
                                                <Zap className="h-3.5 w-3.5 text-orange-500" />
                                                <span className="text-zinc-400">{t('공격')}</span>
                                                <span className="ml-auto font-bold text-orange-500">+{stats.attack}</span>
                                            </div>
                                        )}
                                        {stats.defense > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-sm">
                                                <Shield className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                                                <span className="text-zinc-400">{t('방어')}</span>
                                                <span className="ml-auto font-bold text-blue-500">+{stats.defense}</span>
                                            </div>
                                        )}
                                        {stats.speed > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-sm">
                                                <Gauge className="h-3.5 w-3.5 text-green-500" />
                                                <span className="text-zinc-400">{t('속도')}</span>
                                                <span className="ml-auto font-bold text-green-500">+{stats.speed}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* 필요 재료 */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-zinc-400 mb-3">{lang === 'ko' ? '필요 재료' : 'Required Materials'}</h4>
                                <div className="space-y-2">
                                    {selectedRecipe.materials.map(mat => {
                                        const matItem = GAME_ITEMS[mat.itemId];
                                        const owned = getItemCount(mat.itemId);
                                        const enough = owned >= mat.quantity;

                                        return (
                                            <div
                                                key={mat.itemId}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${enough ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{matItem?.emoji}</span>
                                                    <span className="font-medium">{t(matItem?.name ?? mat.itemId)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
                                                        {owned}
                                                    </span>
                                                    <span className="text-zinc-500">/</span>
                                                    <span className="text-zinc-400">{mat.quantity}</span>
                                                    {enough ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 제작 버튼 */}
                            {canCraft(selectedRecipe) ? (
                                <button
                                    onClick={() => handleStartCraft(selectedRecipe)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Hammer className="w-5 h-5" />
                                        {lang === 'ko' ? '제작하기' : 'Craft'}
                                    </span>
                                </button>
                            ) : (
                                <div className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-400 text-center font-medium">
                                    <span className="flex items-center justify-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        {lang === 'ko' ? '재료가 부족합니다' : 'Insufficient materials'}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 제작 모달 */}
            <CraftingModal
                isOpen={craftingModal.isOpen}
                onClose={() => setCraftingModal({ isOpen: false, recipe: null })}
                recipe={craftingModal.recipe}
                onComplete={handleCraftComplete}
            />

            {/* 토스트 */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        key={activeToast.key}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-50 ${activeToast.tone === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                        {activeToast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
