'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gem, ShoppingCart, Swords, PawPrint, Package } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    type Character,
    type GameItem,
    GAME_ITEMS,
    ITEM_RARITY_COLORS,
    loadCharacter,
    saveCharacter,
    addItemToInventory,
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';

type ShopTab = 'gold' | 'gem';

function getGoldShopItems(): GameItem[] {
    return Object.values(GAME_ITEMS).filter((item) => item.shopGoldPrice != null);
}

function getGemShopItems(): GameItem[] {
    return Object.values(GAME_ITEMS).filter((item) => item.shopGemPrice != null);
}

export default function Shop() {
    const { t } = useLanguage();
    const [character, setCharacter] = useState<Character | null>(null);
    const [activeTab, setActiveTab] = useState<ShopTab>('gold');
    const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

    useEffect(() => {
        setCharacter(loadCharacter());
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 1500);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleBuy = (item: GameItem) => {
        if (!character) return;

        if (activeTab === 'gold') {
            const price = item.shopGoldPrice!;
            if (character.gold < price) {
                setToast({ message: t('골드가 부족합니다!'), tone: 'error' });
                return;
            }
            character.gold -= price;
        } else {
            const price = item.shopGemPrice!;
            if (character.gem < price) {
                setToast({ message: t('젬이 부족합니다!'), tone: 'error' });
                return;
            }
            character.gem -= price;
        }

        saveCharacter(character);
        addItemToInventory(item.id, 1);
        setCharacter({ ...character });
        setToast({ message: `${item.emoji} ${t(item.name)} ${t('구매 완료!')}`, tone: 'success' });
    };

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <PawPrint className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black mb-3">{t('캐릭터가 없습니다')}</h2>
                    <p className="text-foreground/60 mb-6">
                        {t('상점을 이용하려면 먼저 캐릭터를 생성하세요!')}
                    </p>
                    <Link
                        href="/superpet"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                    >
                        <PawPrint className="h-5 w-5" />
                        {t('캐릭터 만들러 가기')}
                    </Link>
                </motion.div>
            </div>
        );
    }

    const shopItems = activeTab === 'gold' ? getGoldShopItems() : getGemShopItems();

    return (
        <div className="max-w-4xl mx-auto px-4 py-2 lg:p-12">
            {/* 헤더 */}
            <div className="text-center mb-4 lg:mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tighter mb-3"
                >
                    <ShoppingCart className="inline h-8 w-8 text-amber-500 mr-2" />
                    {t('상점')}
                </motion.h1>
            </div>

            {/* 보유 재화 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-6 mb-6"
            >
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/10 text-sm">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-amber-600">{character.gold.toLocaleString()}</span>
                    <span className="text-foreground/40 text-xs">{t('골드')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/10 text-sm">
                    <Gem className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-purple-600">{character.gem.toLocaleString()}</span>
                    <span className="text-foreground/40 text-xs">{t('젬')}</span>
                </div>
            </motion.div>

            {/* 탭 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 mb-6"
            >
                <button
                    onClick={() => setActiveTab('gold')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'gold'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                        }`}
                >
                    <Coins className="h-4 w-4" />
                    {t('골드 상점')}
                </button>
                <button
                    onClick={() => setActiveTab('gem')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'gem'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                        }`}
                >
                    <Gem className="h-4 w-4" />
                    {t('젬 상점')}
                </button>
            </motion.div>

            {/* 상품 목록 */}
            {shopItems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-foreground/40"
                >
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">{t('판매 중인 상품이 없습니다')}</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {shopItems.map((item, idx) => {
                        const price = activeTab === 'gold' ? item.shopGoldPrice! : item.shopGemPrice!;
                        const canAfford = activeTab === 'gold' ? character.gold >= price : character.gem >= price;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                className={`p-5 rounded-2xl border-2 text-center ${ITEM_RARITY_COLORS[item.rarity]}`}
                            >
                                <div className="text-4xl mb-3">{item.emoji}</div>
                                <h3 className="font-bold text-sm mb-1">{t(item.name)}</h3>
                                <p className="text-xs text-foreground/50 mb-3 line-clamp-2">{t(item.description)}</p>

                                {/* 스탯 미리보기 */}
                                <div className="flex flex-wrap justify-center gap-1 text-[11px] text-foreground/50 mb-3">
                                    {item.stats.hp > 0 && <span>HP+{item.stats.hp}</span>}
                                    {item.stats.attack > 0 && <span>{t('공')}+{item.stats.attack}</span>}
                                    {item.stats.defense > 0 && <span>{t('방')}+{item.stats.defense}</span>}
                                    {item.stats.speed > 0 && <span>{t('속')}+{item.stats.speed}</span>}
                                </div>

                                {/* 가격 & 구매 */}
                                <div className="flex items-center justify-center gap-1 mb-3">
                                    {activeTab === 'gold' ? (
                                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                                    ) : (
                                        <Gem className="h-3.5 w-3.5 text-purple-500" />
                                    )}
                                    <span className={`font-bold text-sm ${activeTab === 'gold' ? 'text-amber-600' : 'text-purple-600'}`}>
                                        {price.toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-colors ${canAfford
                                        ? activeTab === 'gold'
                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                            : 'bg-purple-500 text-white hover:bg-purple-600'
                                        : 'bg-foreground/10 text-foreground/30 cursor-not-allowed'
                                        }`}
                                >
                                    {t('구매')}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* 토스트 */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-50 ${toast.tone === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
