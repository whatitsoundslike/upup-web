'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Swords, Coins, Gem, X, Heart, Shield, Zap, Gauge } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    type InventoryItem,
    type Character,
    ITEM_RARITY_COLORS,
    ITEM_RARITY_BORDER,
    ITEM_RARITY_TEXT,
    ITEM_SELL_PRICE,
    loadInventory,
    saveInventory,
    getExpForNextLevel,
    loadCharacter,
    addGoldToCharacter,
} from '../types';

const STAT_ICONS = {
    hp: Heart,
    attack: Zap,
    defense: Shield,
    speed: Gauge,
};

export default function Room() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    useEffect(() => {
        setInventory(loadInventory());
        setCharacter(loadCharacter());
    }, []);

    const handleSell = (itemId: string) => {
        const entry = inventory.find((e) => e.item.id === itemId);
        if (!entry) return;
        const gold = ITEM_SELL_PRICE[entry.item.rarity];
        const updated = inventory
            .map((e) =>
                e.item.id === itemId
                    ? { ...e, quantity: e.quantity - 1 }
                    : e
            )
            .filter((e) => e.quantity > 0);
        setInventory(updated);
        saveInventory(updated);
        const updatedChar = addGoldToCharacter(gold);
        setCharacter(updatedChar);
        if (selectedItem?.item.id === itemId) {
            const remaining = updated.find((e) => e.item.id === itemId);
            setSelectedItem(remaining ?? null);
        }
    };

    const handleSellAll = (itemId: string) => {
        const entry = inventory.find((e) => e.item.id === itemId);
        if (!entry) return;
        const gold = ITEM_SELL_PRICE[entry.item.rarity] * entry.quantity;
        const updated = inventory.filter((e) => e.item.id !== itemId);
        setInventory(updated);
        saveInventory(updated);
        const updatedChar = addGoldToCharacter(gold);
        setCharacter(updatedChar);
        setSelectedItem(null);
    };

    const totalItems = inventory.reduce((sum, e) => sum + e.quantity, 0);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* 헤더 */}
            <div className="text-center mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tighter mb-3"
                >
                    마이펫 <span className="text-amber-500">Room</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-foreground/60"
                >
                    던전에서 획득한 아이템을 확인하세요
                </motion.p>
            </div>

            {/* 캐릭터 프로필 카드 */}
            {character && (() => {
                const nextExp = getExpForNextLevel(character.level);
                const expPct = Math.min((character.exp / nextExp) * 100, 100);
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass p-5 rounded-xl bg-white/5 mb-8"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className="text-3xl">🐾</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold truncate">{character.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">
                                        Lv.{character.level}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground/50">{character.className} / {character.element}</p>
                            </div>
                            <div className="flex gap-3 text-xs text-foreground/60">
                                {(Object.entries(STAT_ICONS) as [keyof typeof STAT_ICONS, typeof Heart][]).map(([key, Icon]) => (
                                    <span key={key} className="flex items-center gap-0.5">
                                        <Icon className="h-3 w-3" />
                                        {key === 'hp' ? `${character.currentHp}/${character.hp}` : character[key]}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* 재화 표시 */}
                        <div className="flex gap-3 mb-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-sm">
                                <Coins className="h-4 w-4 text-amber-500" />
                                <span className="font-bold text-amber-600">{character.gold.toLocaleString()}</span>
                                <span className="text-foreground/40 text-xs">골드</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-sm">
                                <Gem className="h-4 w-4 text-purple-500" />
                                <span className="font-bold text-purple-600">{character.gem.toLocaleString()}</span>
                                <span className="text-foreground/40 text-xs">젬</span>
                            </div>
                        </div>
                        {/* 경험치 바 */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-foreground/50">EXP</span>
                                <span className="text-foreground/60 font-medium">{character.exp} / {nextExp}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${expPct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-amber-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })()}

            {/* 요약 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mb-6"
            >
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Package className="h-4 w-4" />
                    <span>아이템 <span className="font-bold text-foreground">{inventory.length}</span>종 / 총 <span className="font-bold text-foreground">{totalItems}</span>개</span>
                </div>
                <Link
                    href="/superpet/dungeon"
                    className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                    <Swords className="h-4 w-4" /> 던전 가기
                </Link>
            </motion.div>

            {/* 빈 인벤토리 */}
            {inventory.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-2xl bg-white/5 text-center"
                >
                    <Package className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">아이템이 없습니다</h3>
                    <p className="text-sm text-foreground/50 mb-6">
                        던전에서 승리하면 아이템을 획득할 수 있어요!
                    </p>
                    <Link
                        href="/superpet/dungeon"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                    >
                        <Swords className="h-5 w-5" /> 던전 탐험하기
                    </Link>
                </motion.div>
            )}

            {/* 아이템 그리드 */}
            {inventory.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {inventory.map((entry, idx) => (
                        <motion.button
                            key={entry.item.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            whileHover={{ y: -3 }}
                            onClick={() => setSelectedItem(entry)}
                            className={`relative p-5 rounded-2xl border-2 text-center transition-all ${ITEM_RARITY_COLORS[entry.item.rarity]} ${selectedItem?.item.id === entry.item.id ? 'ring-2 ring-amber-500' : ''
                                }`}
                        >
                            <div className="text-4xl mb-3">{entry.item.emoji}</div>
                            <h4 className="text-sm font-bold mb-1 truncate">{entry.item.name}</h4>
                            <span className={`text-xs font-semibold ${ITEM_RARITY_TEXT[entry.item.rarity]}`}>
                                {entry.item.rarity}
                            </span>
                            {/* 수량 뱃지 */}
                            <span className="absolute top-2 right-2 min-w-[24px] h-6 flex items-center justify-center px-1.5 rounded-full bg-foreground/80 text-background text-xs font-bold">
                                {entry.quantity}
                            </span>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* 아이템 상세 모달 */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full max-w-sm p-6 rounded-2xl border-2 shadow-2xl bg-zinc-50 dark:bg-zinc-900 ${ITEM_RARITY_BORDER[selectedItem.item.rarity]}`}
                        >
                            {/* 닫기 */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center mb-4">
                                <div className="text-6xl mb-3">{selectedItem.item.emoji}</div>
                                <h3 className="text-xl font-black">{selectedItem.item.name}</h3>
                                <span className={`text-sm font-semibold ${ITEM_RARITY_TEXT[selectedItem.item.rarity]}`}>
                                    {selectedItem.item.rarity}
                                </span>
                                <span className="text-sm text-foreground/50 ml-2">x{selectedItem.quantity}</span>
                            </div>

                            <p className="text-sm text-foreground/60 leading-relaxed text-center mb-4">
                                {selectedItem.item.description}
                            </p>

                            {/* 능력치 */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {selectedItem.stats.hp > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-sm">
                                        <Heart className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-foreground/70">HP</span>
                                        <span className="ml-auto font-bold text-red-500">+{selectedItem.stats.hp}</span>
                                    </div>
                                )}
                                {selectedItem.stats.attack > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 text-sm">
                                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                                        <span className="text-foreground/70">공격</span>
                                        <span className="ml-auto font-bold text-orange-500">+{selectedItem.stats.attack}</span>
                                    </div>
                                )}
                                {selectedItem.stats.defense > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-sm">
                                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-foreground/70">방어</span>
                                        <span className="ml-auto font-bold text-blue-500">+{selectedItem.stats.defense}</span>
                                    </div>
                                )}
                                {selectedItem.stats.speed > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-sm">
                                        <Gauge className="h-3.5 w-3.5 text-green-500" />
                                        <span className="text-foreground/70">속도</span>
                                        <span className="ml-auto font-bold text-green-500">+{selectedItem.stats.speed}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSell(selectedItem.item.id)}
                                    className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-600 font-semibold text-sm hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Coins className="h-4 w-4" /> 1개 판매 ({ITEM_SELL_PRICE[selectedItem.item.rarity]}G)
                                </button>
                                {selectedItem.quantity > 1 && (
                                    <button
                                        onClick={() => handleSellAll(selectedItem.item.id)}
                                        className="py-3 px-4 rounded-xl bg-amber-500/10 text-amber-600 font-semibold text-sm hover:bg-amber-500/20 transition-colors"
                                    >
                                        전부 판매 ({ITEM_SELL_PRICE[selectedItem.item.rarity] * selectedItem.quantity}G)
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
