'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Swords, Coins, Gem, X, Heart, Shield, Zap, Gauge, Search, Sword, Feather, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    type InventoryItem,
    type Character,
    type GameItem,
    type EquipmentSlot,
    ITEM_RARITY_COLORS,
    ITEM_RARITY_BORDER,
    ITEM_RARITY_TEXT,
    ITEM_SELL_PRICE,
    GAME_ITEMS,
    loadInventory,
    saveInventory,
    getExpForNextLevel,
    loadCharacter,
    addGoldToCharacter,
    useFood,
    equipItem,
    unequipItem,
    saveCharacter,
    calculateEquipmentStats,
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const STAT_ICONS = {
    hp: { icon: Heart, color: 'text-red-500 fill-red-500' },
    attack: { icon: Sword, color: 'text-red-500' },
    defense: { icon: Shield, color: 'text-blue-500 fill-blue-500' },
    speed: { icon: Feather, color: 'text-green-500' },
};

const SLOT_OPTIONS: (EquipmentSlot | 'all')[] = ['all', '투구', '갑옷', '장갑', '부츠', '망토', '무기', '방패', '목걸이', '반지'];

export default function Room() {
    const { t, lang } = useLanguage();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const [sellConfirm, setSellConfirm] = useState<{ itemId: string; sellAll: boolean } | null>(null);
    const [searchName, setSearchName] = useState('');
    const [slotFilter, setSlotFilter] = useState<EquipmentSlot | 'all'>('all');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        setInventory(loadInventory());
        setCharacter(loadCharacter());
    }, []);

    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => setActiveToast(null), 2400);
        return () => clearTimeout(timer);
    }, [activeToast]);

    const showToast = (message: string, tone: 'success' | 'error') => {
        setActiveToast({ message, tone, key: Date.now() });
    };

    const handleSellRequest = (itemId: string, sellAll: boolean) => {
        setSellConfirm({ itemId, sellAll });
    };

    const handleSellConfirm = () => {
        if (!sellConfirm) return;
        const { itemId, sellAll } = sellConfirm;

        if (sellAll) {
            const entry = inventory.find((e) => e.item.id === itemId);
            if (!entry || entry.quantity <= 0) return;
            const gold = ITEM_SELL_PRICE[entry.item.rarity] * entry.quantity;
            const updated = inventory.filter((e) => e.item.id !== itemId);
            setInventory(updated);
            saveInventory(updated);
            const updatedChar = addGoldToCharacter(gold);
            setCharacter(updatedChar);
            setSelectedItem(null);
            showToast(
                lang === 'ko'
                    ? `${entry.item.name} ${entry.quantity}개를 ${gold}G에 판매했습니다!`
                    : `Sold ${entry.quantity}x ${t(entry.item.name)} for ${gold}G!`,
                'success'
            );
        } else {
            const entry = inventory.find((e) => e.item.id === itemId);
            if (!entry || entry.quantity <= 0) return;
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
            showToast(
                lang === 'ko'
                    ? `${entry.item.name}을(를) ${gold}G에 판매했습니다!`
                    : `Sold ${t(entry.item.name)} for ${gold}G!`,
                'success'
            );
        }

        setSellConfirm(null);
    };

    const handleUseFood = (itemId: string) => {
        const result = useFood(itemId);
        if (result.success) {
            const updatedInventory = loadInventory();
            const updatedCharacter = loadCharacter();
            setInventory(updatedInventory);
            setCharacter(updatedCharacter);
            const remaining = updatedInventory.find((e) => e.item.id === itemId);
            setSelectedItem(remaining ?? null);
            const msg = lang === 'ko'
                ? `${result.itemName}을(를) 사용하여 HP ${result.hpRecovered} 회복했습니다!`
                : `Used ${t(result.itemName!)} to recover ${result.hpRecovered} HP!`;
            showToast(msg, 'success');
        } else {
            showToast(t(result.message), 'error');
        }
    };

    const handleEquip = (itemId: string) => {
        const result = equipItem(itemId);
        if (result.success) {
            setInventory(loadInventory());
            setCharacter(loadCharacter());
            const remaining = loadInventory().find((e) => e.item.id === itemId);
            setSelectedItem(remaining ?? null);
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleUnequip = (slot: EquipmentSlot) => {
        const result = unequipItem(slot);
        if (result.success) {
            setInventory(loadInventory());
            setCharacter(loadCharacter());
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleShare = () => {
        if (!character || isSharing) return;
        setIsSharing(true);

        const tweetText = lang === 'ko'
            ? `🐾 내 슈퍼펫 「${character.name}」을(를) 소개합니다!\nLv.${character.level} ${character.className} | ${character.element}\n#SuperPet #슈퍼펫`
            : `🐾 Meet my Super Pet "${character.name}"!\nLv.${character.level} ${character.className} | ${character.element}\n#SuperPet`;
        const tweetUrl = 'https://zroom.io/superpet';
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`,
            '_blank',
            'noopener,noreferrer'
        );

        setIsSharing(false);
    };

    const totalItems = inventory.reduce((sum, e) => sum + e.quantity, 0);
    const equippedEntries = character
        ? (Object.entries(character.equipment) as [EquipmentSlot, GameItem | null][])
        : [];

    const filteredInventory = inventory.filter((entry) => {
        if (searchName && !entry.item.name.includes(searchName) && !t(entry.item.name).toLowerCase().includes(searchName.toLowerCase())) return false;
        if (slotFilter !== 'all') {
            if (entry.item.type !== 'equipment' || entry.item.equipmentSlot !== slotFilter) return false;
        }
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-2 lg:p-12">
            {/* 헤더 */}
            <div className="text-center mb-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tighter mb-3"
                >
                    {t('마이펫')} <span className="text-amber-500">Room</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-foreground/60 lg:mb-12"
                >
                    {t('던전에서 획득한 아이템을 확인하세요')}
                </motion.p>
            </div>

            {/* 캐릭터 프로필 카드 */}
            {character && (() => {
                const nextExp = getExpForNextLevel(character.level);
                const expPct = Math.min((character.exp / nextExp) * 100, 100);
                const equipmentStats = calculateEquipmentStats(character);
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-5 rounded-xl bg-white/5 shadow-lg border border-foreground/10"
                    >
                        <div className="flex items-center gap-4 mb-3">
                            {character.image ? (
                                <img src={character.image} alt={character.name} className="w-27 h-40 object-cover rounded-xl border border-amber-500" />
                            ) : (
                                <div className="text-3xl">🐾</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold truncate">{character.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">
                                        Lv.{character.level}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground/50">{t(character.className)} / {t(character.element)}</p>
                            </div>
                            <div className="flex flex-col gap-1 text-[11px] sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1 sm:text-xs text-foreground/60">
                                {(Object.entries(STAT_ICONS) as [keyof typeof STAT_ICONS, (typeof STAT_ICONS)[keyof typeof STAT_ICONS]][]).map(([key, { icon: Icon, color }]) => {
                                    const bonus = equipmentStats[key];
                                    const baseValue = character[key];
                                    if (key === 'hp') {
                                        const totalHp = character.hp + bonus;
                                        return (
                                            <span key={key} className="flex items-center gap-0.5">
                                                <Icon className={`h-3 w-3 ${color}`} />
                                                {character.currentHp}/{totalHp}{' '}
                                                <span className={bonus > 0 ? 'text-emerald-500' : 'text-foreground/40'}>
                                                    {`(+${bonus})`}
                                                </span>
                                            </span>
                                        );
                                    }
                                    return (
                                        <span key={key} className="flex items-center gap-0.5">
                                            <Icon className={`h-3 w-3 ${color}`} />
                                            {baseValue}{' '}
                                            <span className={bonus > 0 ? 'text-emerald-500' : 'text-foreground/40'}>
                                                {`(+${bonus})`}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        {/* 재화 표시 */}
                        <div className="flex gap-3 mb-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-sm">
                                <Coins className="h-4 w-4 text-amber-500" />
                                <span className="font-bold text-amber-600">{character.gold.toLocaleString()}</span>
                                <span className="text-foreground/40 text-xs">{t('골드')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-sm">
                                <Gem className="h-4 w-4 text-purple-500" />
                                <span className="font-bold text-purple-600">{character.gem.toLocaleString()}</span>
                                <span className="text-foreground/40 text-xs">{t('젬')}</span>
                            </div>
                        </div>
                        {/* 경험치 바 */}
                        <div>
                            <div className="flex gap-2 text-xs mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">EXP</span>
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
                        {/* 트위터 공유 버튼 */}
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="mt-3 w-full py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            {isSharing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            )}
                            {t('트위터에 슈퍼펫 알려주기')}
                        </button>
                    </motion.div>
                );
            })()}

            {/* 장착 장비 */}
            {character && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="glass p-5 rounded-xl bg-white/5 mb-8 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">{t('장착 장비')}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {equippedEntries.map(([slot, item]) => (
                            <button
                                key={slot}
                                onClick={() => {
                                    if (item) {
                                        const inventoryFormat: InventoryItem = {
                                            item: item,
                                            quantity: 0,
                                            stats: { ...item.stats },
                                            equipedItem: [item]
                                        };
                                        setSelectedItem(inventoryFormat);
                                    }
                                }}
                                disabled={!item}
                                className={`flex items-center gap-3 rounded-xl border-1 px-3 py-2 text-left transition-all ${item?.rarity ? ITEM_RARITY_COLORS[item.rarity] : 'border-foreground/10 bg-white/5'
                                    } ${item ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className="text-2xl">{item?.emoji ?? '—'}</div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs text-foreground/50">{t(slot)}</div>
                                    <div className="text-sm font-semibold truncate">{item ? t(item.name) : t('비어있음')}</div>
                                    {item && (
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-tight text-foreground/60">
                                            <span className={`rounded-full px-2 py-0.5 font-semibold bg-foreground/5 ring-1 ring-foreground/10 ${ITEM_RARITY_TEXT[item.rarity]}`}>
                                                {t(item.rarity)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 빈 인벤토리 */}
            {inventory.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-2xl bg-white/5 text-center"
                >
                    <Package className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">{t('아이템이 없습니다')}</h3>
                    <p className="text-sm text-foreground/50 mb-6">
                        {t('던전에서 승리하면 아이템을 획득할 수 있어요!')}
                    </p>
                    <Link
                        href="/superpet/dungeon"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                    >
                        <Swords className="h-5 w-5" /> {t('던전 탐험하기')}
                    </Link>
                </motion.div>
            )}

            {/* 필터 */}
            {inventory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex gap-3 mb-6"
                >
                    <select
                        value={slotFilter}
                        onChange={(e) => setSlotFilter(e.target.value as EquipmentSlot | 'all')}
                        className="px-3 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        {SLOT_OPTIONS.map((slot) => (
                            <option key={slot} value={slot}>{slot === 'all' ? t('전체 부위') : t(slot)}</option>
                        ))}
                    </select>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder={t('아이템 이름 검색')}
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="w-50 pl-9 pr-3 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                </motion.div>
            )}

            {/* 아이템 그리드 */}
            {inventory.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredInventory.map((entry, idx) => (
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
                            <h4 className="text-sm font-bold mb-1 truncate">{t(entry.item.name)}</h4>
                            <span className={`text-xs font-semibold ${ITEM_RARITY_TEXT[entry.item.rarity]}`}>
                                {t(entry.item.rarity)}
                            </span>
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
                        {(() => {
                            const modalItem = GAME_ITEMS[selectedItem.item.id] ?? selectedItem.item;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`relative w-full max-w-sm p-6 rounded-2xl border-2 shadow-2xl bg-zinc-50 dark:bg-zinc-900 ${ITEM_RARITY_BORDER[modalItem.rarity]}`}
                                >
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <div className="text-center mb-4">
                                        <div className="text-6xl mb-3">{modalItem.emoji}</div>
                                        <h3 className="text-xl font-black">{t(modalItem.name)}</h3>
                                        <span className={`text-sm font-semibold ${ITEM_RARITY_TEXT[modalItem.rarity]}`}>
                                            {t(modalItem.rarity)}
                                        </span>
                                        <span className="text-sm text-foreground/50 ml-2">
                                            {selectedItem.quantity > 0 ? `x${selectedItem.quantity}` : t('장착중')}
                                        </span>
                                    </div>

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
                                                <span className="text-foreground/70">{t('공격')}</span>
                                                <span className="ml-auto font-bold text-orange-500">+{selectedItem.stats.attack}</span>
                                            </div>
                                        )}
                                        {selectedItem.stats.defense > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-sm">
                                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-foreground/70">{t('방어')}</span>
                                                <span className="ml-auto font-bold text-blue-500">+{selectedItem.stats.defense}</span>
                                            </div>
                                        )}
                                        {selectedItem.stats.speed > 0 && (
                                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-sm">
                                                <Gauge className="h-3.5 w-3.5 text-green-500" />
                                                <span className="text-foreground/70">{t('속도')}</span>
                                                <span className="ml-auto font-bold text-green-500">+{selectedItem.stats.speed}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {modalItem.type === 'food' && (
                                            <button
                                                onClick={() => handleUseFood(selectedItem.item.id)}
                                                disabled={selectedItem.quantity <= 0}
                                                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 disabled:bg-green-500/40 disabled:text-white/60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Heart className="h-4 w-4" /> {t('사용하기')}
                                            </button>
                                        )}
                                        {modalItem.type === 'equipment' && modalItem.equipmentSlot && (() => {
                                            const slot = modalItem.equipmentSlot;
                                            const isEquipped = character?.equipment[slot]?.id === selectedItem.item.id;

                                            return isEquipped ? (
                                                <button
                                                    onClick={() => handleUnequip(slot)}
                                                    className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <X className="h-4 w-4" /> {t('장비 해제')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEquip(selectedItem.item.id)}
                                                    className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Shield className="h-4 w-4" /> {t('장착하기')}
                                                </button>
                                            );
                                        })()}
                                    </div>

                                    {selectedItem.quantity > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSellRequest(selectedItem.item.id, false)}
                                                className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-600 font-semibold text-sm hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Coins className="h-4 w-4" /> {t('1개 판매')} ({ITEM_SELL_PRICE[modalItem.rarity]}G)
                                            </button>
                                            {selectedItem.quantity > 1 && (
                                                <button
                                                    onClick={() => handleSellRequest(selectedItem.item.id, true)}
                                                    className="py-3 px-4 rounded-xl bg-amber-500/10 text-amber-600 font-semibold text-sm hover:bg-amber-500/20 transition-colors"
                                                >
                                                    {t('전부 판매')} ({ITEM_SELL_PRICE[modalItem.rarity] * selectedItem.quantity}G)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeToast && (
                    <motion.div
                        key={activeToast.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4"
                    >
                        <div
                            className={`w-full max-w-sm rounded-full px-4 py-3 text-sm font-semibold shadow-lg ${activeToast.tone === 'success'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                                }`}
                        >
                            {activeToast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 판매 확인 모달 */}
            <AnimatePresence>
                {sellConfirm && (() => {
                    const entry = inventory.find((e) => e.item.id === sellConfirm.itemId);
                    if (!entry) return null;
                    const totalGold = sellConfirm.sellAll
                        ? ITEM_SELL_PRICE[entry.item.rarity] * entry.quantity
                        : ITEM_SELL_PRICE[entry.item.rarity];
                    const quantityText = sellConfirm.sellAll ? `${entry.quantity}${lang === 'ko' ? '개' : 'x'}` : `1${lang === 'ko' ? '개' : 'x'}`;

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                            onClick={() => setSellConfirm(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                            >
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">{entry.item.emoji}</div>
                                    <h3 className="text-xl font-black mb-2">{t('정말 판매하시겠습니까?')}</h3>
                                    <p className="text-sm text-foreground/60">
                                        {lang === 'ko' ? (
                                            <>
                                                <span className="font-bold text-foreground">{entry.item.name}</span> {quantityText}를<br />
                                                <span className="font-bold text-amber-600">{totalGold}G</span>에 판매합니다
                                            </>
                                        ) : (
                                            <>
                                                Sell <span className="font-bold text-foreground">{quantityText} {t(entry.item.name)}</span><br />
                                                for <span className="font-bold text-amber-600">{totalGold}G</span>
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSellConfirm(null)}
                                        className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                    >
                                        {t('취소')}
                                    </button>
                                    <button
                                        onClick={handleSellConfirm}
                                        className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Coins className="h-4 w-4" /> {t('판매')}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
