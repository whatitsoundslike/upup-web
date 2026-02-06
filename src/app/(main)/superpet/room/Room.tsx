'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Swords, Coins, Gem, X, Heart, Shield, Zap, Gauge, Search, Sword, Feather, Loader2, UserPlus, Copy, CheckSquare, Square, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    type InventoryItem,
    type Character,
    type GameItem,
    type EquipmentSlot,
    type EquippedItem,
    type EnhanceResult,
    type EnhanceScrollType,
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
    getRequiredScrollType,
    getEnhancedStats,
    getEnhancementBonus,
    MAX_ENHANCE_LEVEL,
    getEnhanceSuccessRate,
    CEILING_LEVELS,
} from '../types';
import EnhanceModal from '../components/EnhanceModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useDebouncedSave, saveToServer } from '../gameSync';
import { fetchGemBalance } from '../gemApi';
import { useAuth } from '@/components/AuthProvider';
import { shareToTwitter } from '../utils/shareUtils';

const STAT_ICONS = {
    hp: { icon: Heart, color: 'text-red-500 fill-red-500' },
    attack: { icon: Sword, color: 'text-red-500' },
    defense: { icon: Shield, color: 'text-blue-500 fill-blue-500' },
    speed: { icon: Feather, color: 'text-green-500' },
};

const SLOT_OPTIONS: (EquipmentSlot | 'all')[] = ['all', '투구', '갑옷', '장갑', '부츠', '망토', '무기', '방패', '목걸이', '반지'];

export default function Room() {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [character, setCharacter] = useState<Character | null>(null);
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const [sellConfirm, setSellConfirm] = useState<{ itemId: string; sellAll: boolean } | null>(null);
    const [searchName, setSearchName] = useState('');
    const [slotFilter, setSlotFilter] = useState<EquipmentSlot | 'all'>('all');
    const [isSharing, setIsSharing] = useState(false);
    const [showShareLoginModal, setShowShareLoginModal] = useState(false);
    const [showLinkCopiedModal, setShowLinkCopiedModal] = useState(false);
    const [enhanceModal, setEnhanceModal] = useState<{
        isOpen: boolean;
        target: {
            type: 'inventory' | 'equipped';
            item: InventoryItem | null;
            slot?: EquipmentSlot;
            instanceId?: string;
        } | null;
        scrollId: string;
    }>({ isOpen: false, target: null, scrollId: '' });
    const debouncedSaveToServer = useDebouncedSave();

    // 일괄 선택 모드
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // instanceId 저장
    const [bulkSellConfirm, setBulkSellConfirm] = useState(false);

    useEffect(() => {
        setInventory(loadInventory());
        setCharacter(loadCharacter());
    }, []);

    // 로그인되어 있으면 서버에서 젬 잔액 조회
    useEffect(() => {
        if (user) {
            fetchGemBalance().then((result) => {
                if (result) {
                    setGemBalance(result.balance);
                }
            });
        }
    }, [user]);

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

    // 일괄 선택 토글
    const toggleBulkSelect = (instanceId: string) => {
        setSelectedItems((prev) => {
            const next = new Set(prev);
            if (next.has(instanceId)) {
                next.delete(instanceId);
            } else {
                next.add(instanceId);
            }
            return next;
        });
    };

    // 전체 선택/해제 (장비 아이템만)
    const toggleSelectAll = () => {
        const equipmentItems = filteredInventory.filter(
            (e) => e.item.type === 'equipment' && e.instanceId
        );
        const allSelected = equipmentItems.every((e) => selectedItems.has(e.instanceId!));
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(equipmentItems.map((e) => e.instanceId!)));
        }
    };

    // 선택된 아이템들의 총 판매 금액 계산
    const getSelectedItemsTotal = () => {
        let total = 0;
        for (const instanceId of selectedItems) {
            const entry = inventory.find((e) => e.instanceId === instanceId);
            if (entry) {
                total += ITEM_SELL_PRICE[entry.item.rarity];
            }
        }
        return total;
    };

    // 일괄 판매 실행
    const handleBulkSellConfirm = () => {
        if (selectedItems.size === 0) return;

        let totalGold = 0;
        const updated = inventory.filter((e) => {
            if (e.instanceId && selectedItems.has(e.instanceId)) {
                totalGold += ITEM_SELL_PRICE[e.item.rarity];
                return false;
            }
            return true;
        });

        setInventory(updated);
        saveInventory(updated);
        const updatedChar = addGoldToCharacter(totalGold);
        setCharacter(updatedChar);

        showToast(
            lang === 'ko'
                ? `${selectedItems.size}개의 장비를 ${totalGold}G에 판매했습니다!`
                : `Sold ${selectedItems.size} items for ${totalGold}G!`,
            'success'
        );

        setSelectedItems(new Set());
        setBulkSelectMode(false);
        setBulkSellConfirm(false);
        debouncedSaveToServer();
    };

    // 일괄 선택 모드 종료
    const exitBulkSelectMode = () => {
        setBulkSelectMode(false);
        setSelectedItems(new Set());
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
            debouncedSaveToServer();
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
            debouncedSaveToServer();
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
            debouncedSaveToServer();
        } else {
            showToast(result.message, 'error');
        }
    };

    // 강화 관련 함수
    const getScrollIdForSlot = (slot: EquipmentSlot): string => {
        const scrollType = getRequiredScrollType(slot);
        const scrollMap: Record<EnhanceScrollType, string> = {
            weapon: 'weapon_enhance_scroll',
            armor: 'armor_enhance_scroll',
            accessory: 'accessory_enhance_scroll',
        };
        return scrollMap[scrollType];
    };

    const getScrollCountForSlot = (slot: EquipmentSlot): number => {
        const scrollId = getScrollIdForSlot(slot);
        const scrollEntry = inventory.find((i) => i.item.id === scrollId);
        return scrollEntry?.quantity ?? 0;
    };

    const handleStartEnhance = (item: InventoryItem, slot: EquipmentSlot, isEquipped: boolean) => {
        const scrollId = getScrollIdForSlot(slot);
        const scrollCount = getScrollCountForSlot(slot);

        if (scrollCount <= 0) {
            const scrollType = getRequiredScrollType(slot);
            const scrollNames: Record<EnhanceScrollType, string> = {
                weapon: '무기 강화 주문서',
                armor: '방어구 강화 주문서',
                accessory: '악세사리 강화 주문서',
            };
            showToast(lang === 'ko' ? `${scrollNames[scrollType]}가 필요합니다.` : `${scrollNames[scrollType]} required.`, 'error');
            return;
        }

        setEnhanceModal({
            isOpen: true,
            target: {
                type: isEquipped ? 'equipped' : 'inventory',
                item,
                slot,
                instanceId: item.instanceId,
            },
            scrollId,
        });
    };

    const handleEnhanceComplete = (result: EnhanceResult) => {
        const updatedInventory = loadInventory();
        const updatedCharacter = loadCharacter();
        setInventory(updatedInventory);
        setCharacter(updatedCharacter);

        // 선택된 아이템 업데이트
        if (selectedItem && selectedItem.instanceId) {
            // 인벤토리에서 찾기
            const updatedInInventory = updatedInventory.find((i) => i.instanceId === selectedItem.instanceId);
            if (updatedInInventory) {
                setSelectedItem(updatedInInventory);
            } else if (updatedCharacter) {
                // 장착된 장비에서 찾기
                for (const slot of Object.keys(updatedCharacter.equipment) as EquipmentSlot[]) {
                    const equipped = updatedCharacter.equipment[slot];
                    if (equipped && equipped.instanceId === selectedItem.instanceId) {
                        const enhanceLevel = equipped.enhanceLevel ?? 0;
                        const inventoryFormat: InventoryItem = {
                            item: equipped.item,
                            instanceId: equipped.instanceId,
                            enhanceLevel: equipped.enhanceLevel,
                            quantity: 0,
                            stats: enhanceLevel > 0 ? getEnhancedStats(equipped.item.stats, enhanceLevel, slot, equipped.item.rarity) : { ...equipped.item.stats },
                            equipedItem: [equipped.item]
                        };
                        setSelectedItem(inventoryFormat);
                        break;
                    }
                }
            }
        }

        if (result.success) {
            showToast(result.message, 'success');
        }

        // 강화 후 즉시 서버 저장
        saveToServer();
    };

    const handleShare = () => {
        if (!character || isSharing) return;

        setIsSharing(true);
        shareToTwitter({ character, lang });
        setIsSharing(false);
    };

    const handleCopyLink = async () => {
        if (!character) return;

        // 로그인 사용자: 캐릭터 공유 페이지, 비로그인: 홈페이지
        const shareUrl = user
            ? `https://zroom.io/superpet/share/${character.id}`
            : `https://zroom.io/superpet`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setShowLinkCopiedModal(true);
        } catch {
            // 클립보드 복사 실패 시 폴백
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setShowLinkCopiedModal(true);
        }
    };

    const totalItems = inventory.reduce((sum, e) => sum + e.quantity, 0);
    const equippedEntries = character
        ? (Object.entries(character.equipment) as [EquipmentSlot, EquippedItem | null][])
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
                        className="p-5 rounded-xl bg-white/5 shadow-xl border border-foreground/10"
                    >
                        <div className="flex items-center  gap-4 mb-3">
                            <div className="flex items-center flex-col gap-2">
                                {character.image ? (
                                    <img src={character.image} alt={character.name} className="w-23 h-40 object-cover rounded-xl border border-amber-500" />
                                ) : (
                                    <div className="text-3xl">🐾</div>
                                )}
                                <p className="text-xs text-foreground/50">{t(character.className)} / {t(character.element)}</p>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{character.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shrink-0">
                                        Lv.{character.level}
                                    </span>
                                </div>
                                <div>
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
                                <span className="font-bold text-purple-600">
                                    {(user && gemBalance !== null ? gemBalance : character.gem).toLocaleString()}
                                </span>
                                <span className="text-foreground/40 text-xs">{t('젬')}</span>
                            </div>
                        </div>
                        {/* 경험치 바 */}
                        <div>
                            <div className="flex gap-2 text-xs mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">EXP</span>
                                <span className="text-foreground/60 font-medium">{character.exp} / {nextExp}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden border border-amber-500">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${expPct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-amber-500"
                                />
                            </div>
                        </div>
                        {/* 공유 버튼 */}
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 border border-transparent dark:border-white/30"
                            >
                                {isSharing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                )}
                                {t('트위터')}
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 py-3 rounded-xl bg-zinc-700 text-white font-bold text-sm hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2 border border-transparent dark:border-white/30"
                            >
                                <Copy className="h-4 w-4" />
                                {t('카드 공유')}
                            </button>
                        </div>
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
                        {equippedEntries.map(([slot, equipped]) => {
                            const item = equipped?.item;
                            const enhanceLevel = equipped?.enhanceLevel ?? 0;
                            return (
                                <button
                                    key={slot}
                                    onClick={() => {
                                        if (item && equipped) {
                                            const inventoryFormat: InventoryItem = {
                                                item: item,
                                                instanceId: equipped.instanceId,
                                                enhanceLevel: equipped.enhanceLevel,
                                                quantity: 0,
                                                stats: enhanceLevel > 0 ? getEnhancedStats(item.stats, enhanceLevel, slot, item.rarity) : { ...item.stats },
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
                                        <div className="text-sm font-semibold truncate">
                                            {item ? t(item.name) : t('비어있음')}
                                            {item && enhanceLevel > 0 && (
                                                <span className="text-amber-500 ml-1">+{enhanceLevel}</span>
                                            )}
                                        </div>
                                        {item && (
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-tight text-foreground/60">
                                                <span className={`rounded-full px-2 py-0.5 font-semibold bg-foreground/5 ring-1 ring-foreground/10 ${ITEM_RARITY_TEXT[item.rarity]}`}>
                                                    {t(item.rarity)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
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
                    className="flex flex-col gap-3 mb-6"
                >
                    <div className="flex gap-3">
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
                    </div>

                    {/* 일괄 선택 모드 토글 */}
                    <div className="flex items-center gap-2">
                        {bulkSelectMode ? (
                            <>
                                <button
                                    onClick={toggleSelectAll}
                                    className="px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-sm font-semibold hover:bg-foreground/10 transition-colors flex items-center gap-2"
                                >
                                    {filteredInventory.filter((e) => e.item.type === 'equipment' && e.instanceId).every((e) => selectedItems.has(e.instanceId!))
                                        ? <CheckSquare className="h-4 w-4 text-amber-500" />
                                        : <Square className="h-4 w-4" />}
                                    {t('전체 선택')}
                                </button>
                                <button
                                    onClick={exitBulkSelectMode}
                                    className="px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-sm font-semibold hover:bg-foreground/10 transition-colors"
                                >
                                    {t('취소')}
                                </button>
                                {selectedItems.size > 0 && (
                                    <button
                                        onClick={() => setBulkSellConfirm(true)}
                                        className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2 ml-auto"
                                    >
                                        <Coins className="h-4 w-4" />
                                        {selectedItems.size}{lang === 'ko' ? '개 판매' : ' Sell'} ({getSelectedItemsTotal()}G)
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setBulkSelectMode(true)}
                                className="px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-sm font-semibold hover:bg-foreground/10 transition-colors flex items-center gap-2"
                            >
                                <CheckSquare className="h-4 w-4" />
                                {t('일괄 선택')}
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* 아이템 그리드 */}
            {inventory.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredInventory.map((entry, idx) => {
                        const isEquipment = entry.item.type === 'equipment';
                        const isSelected = isEquipment && entry.instanceId && selectedItems.has(entry.instanceId);
                        const canSelect = bulkSelectMode && isEquipment && entry.instanceId;

                        return (
                            <motion.button
                                key={entry.instanceId || entry.item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                whileHover={{ y: -3 }}
                                onClick={() => {
                                    if (canSelect) {
                                        toggleBulkSelect(entry.instanceId!);
                                    } else if (!bulkSelectMode) {
                                        setSelectedItem(entry);
                                    }
                                }}
                                className={`relative p-5 rounded-2xl border-2 text-center transition-all ${ITEM_RARITY_COLORS[entry.item.rarity]} ${
                                    isSelected ? 'ring-2 ring-amber-500 bg-amber-500/10' : ''
                                } ${selectedItem?.item.id === entry.item.id && !bulkSelectMode ? 'ring-2 ring-amber-500' : ''} ${
                                    bulkSelectMode && !isEquipment ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                            >
                                {/* 체크박스 (일괄 선택 모드에서 장비 아이템만) */}
                                {bulkSelectMode && isEquipment && (
                                    <div className="absolute top-2 left-2">
                                        {isSelected ? (
                                            <CheckSquare className="h-5 w-5 text-amber-500" />
                                        ) : (
                                            <Square className="h-5 w-5 text-foreground/40" />
                                        )}
                                    </div>
                                )}
                                <div className="text-4xl mb-3">{entry.item.emoji}</div>
                                <h4 className="text-sm font-bold mb-1 truncate">
                                    {t(entry.item.name)}
                                    {isEquipment && (entry.enhanceLevel ?? 0) > 0 && (
                                        <span className="text-amber-500 ml-1">+{entry.enhanceLevel}</span>
                                    )}
                                </h4>
                                <span className={`text-xs font-semibold ${ITEM_RARITY_TEXT[entry.item.rarity]}`}>
                                    {t(entry.item.rarity)}
                                </span>
                                {/* 장비 아이템은 수량 표시 안함 (항상 1개) */}
                                {!isEquipment && (
                                    <span className="absolute top-2 right-2 min-w-[24px] h-6 flex items-center justify-center px-1.5 rounded-full bg-foreground/80 text-background text-xs font-bold">
                                        {entry.quantity}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
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
                                        <h3 className="text-xl font-black">
                                            {t(modalItem.name)}
                                            {modalItem.type === 'equipment' && (selectedItem.enhanceLevel ?? 0) > 0 && (
                                                <span className="text-amber-500 ml-1">+{selectedItem.enhanceLevel}</span>
                                            )}
                                        </h3>
                                        <span className={`text-sm font-semibold ${ITEM_RARITY_TEXT[modalItem.rarity]}`}>
                                            {t(modalItem.rarity)}
                                        </span>
                                        {/* 장비 아이템은 수량 표시 안함 */}
                                        {modalItem.type !== 'equipment' && (
                                            <span className="text-sm text-foreground/50 ml-2">
                                                x{selectedItem.quantity}
                                            </span>
                                        )}
                                    </div>

                                    {(() => {
                                        const enhanceLevel = selectedItem.enhanceLevel ?? 0;
                                        const enhanceBonus = modalItem.type === 'equipment' && modalItem.equipmentSlot && enhanceLevel > 0
                                            ? getEnhancementBonus(modalItem.stats, enhanceLevel, modalItem.equipmentSlot, modalItem.rarity)
                                            : { hp: 0, attack: 0, defense: 0, speed: 0 };
                                        const baseStats = modalItem.stats;

                                        return (
                                            <div className="grid grid-cols-2 gap-2 mb-6">
                                                {(baseStats.hp > 0 || enhanceBonus.hp > 0) && (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-sm">
                                                        <Heart className="h-3.5 w-3.5 text-red-500" />
                                                        <span className="text-foreground/70">HP</span>
                                                        <span className="ml-auto font-bold text-red-500">
                                                            +{baseStats.hp}
                                                            {enhanceBonus.hp > 0 && (
                                                                <span className="text-amber-400 ml-1">(+{enhanceBonus.hp})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {(baseStats.attack > 0 || enhanceBonus.attack > 0) && (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 text-sm">
                                                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                                                        <span className="text-foreground/70">{t('공격')}</span>
                                                        <span className="ml-auto font-bold text-orange-500">
                                                            +{baseStats.attack}
                                                            {enhanceBonus.attack > 0 && (
                                                                <span className="text-amber-400 ml-1">(+{enhanceBonus.attack})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {(baseStats.defense > 0 || enhanceBonus.defense > 0) && (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-sm">
                                                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="text-foreground/70">{t('방어')}</span>
                                                        <span className="ml-auto font-bold text-blue-500">
                                                            +{baseStats.defense}
                                                            {enhanceBonus.defense > 0 && (
                                                                <span className="text-amber-400 ml-1">(+{enhanceBonus.defense})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {(baseStats.speed > 0 || enhanceBonus.speed > 0) && (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-sm">
                                                        <Gauge className="h-3.5 w-3.5 text-green-500" />
                                                        <span className="text-foreground/70">{t('속도')}</span>
                                                        <span className="ml-auto font-bold text-green-500">
                                                            +{baseStats.speed}
                                                            {enhanceBonus.speed > 0 && (
                                                                <span className="text-amber-400 ml-1">(+{enhanceBonus.speed})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

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
                                            const isEquipped = character?.equipment[slot]?.item.id === selectedItem.item.id;
                                            const enhanceLevel = selectedItem.enhanceLevel ?? 0;
                                            const isMaxLevel = enhanceLevel >= MAX_ENHANCE_LEVEL;
                                            const scrollCount = getScrollCountForSlot(slot);
                                            const scrollType = getRequiredScrollType(slot);
                                            const scrollNames: Record<EnhanceScrollType, string> = {
                                                weapon: lang === 'ko' ? '무기 주문서' : 'Weapon Scroll',
                                                armor: lang === 'ko' ? '방어구 주문서' : 'Armor Scroll',
                                                accessory: lang === 'ko' ? '악세 주문서' : 'Accessory Scroll',
                                            };

                                            return (
                                                <>
                                                    {isEquipped ? (
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
                                                    )}
                                                    {scrollCount > 0 && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStartEnhance(selectedItem, slot, isEquipped)}
                                                                disabled={isMaxLevel}
                                                                className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 disabled:bg-purple-500/40 disabled:text-white/60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <span className="text-lg">🔨</span>
                                                                {isMaxLevel ? (
                                                                    lang === 'ko' ? '최대 강화' : 'Max Level'
                                                                ) : (
                                                                    <>
                                                                        {t('강화하기')} (+{enhanceLevel} → +{enhanceLevel + 1})
                                                                    </>
                                                                )}
                                                            </button>
                                                            <div className="text-xs text-foreground/50 text-center">
                                                                {scrollNames[scrollType]}: {scrollCount}개 보유 | 성공률 {Math.round(getEnhanceSuccessRate(enhanceLevel) * 100)}%
                                                                {CEILING_LEVELS.includes(enhanceLevel) && (
                                                                    <span className="text-amber-500 ml-1">🛡️</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
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

            {/* 일괄 판매 확인 모달 */}
            <AnimatePresence>
                {bulkSellConfirm && selectedItems.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setBulkSellConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                        >
                            <div className="text-center mb-6">
                                <Trash2 className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                                <h3 className="text-xl font-black mb-2">{t('일괄 판매')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {lang === 'ko' ? (
                                        <>
                                            선택한 <span className="font-bold text-foreground">{selectedItems.size}개</span>의 장비를<br />
                                            <span className="font-bold text-amber-600">{getSelectedItemsTotal()}G</span>에 판매합니다
                                        </>
                                    ) : (
                                        <>
                                            Sell <span className="font-bold text-foreground">{selectedItems.size} items</span><br />
                                            for <span className="font-bold text-amber-600">{getSelectedItemsTotal()}G</span>
                                        </>
                                    )}
                                </p>
                                {/* 선택된 아이템 미리보기 */}
                                <div className="mt-4 max-h-32 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {Array.from(selectedItems).slice(0, 10).map((instanceId) => {
                                            const entry = inventory.find((e) => e.instanceId === instanceId);
                                            if (!entry) return null;
                                            return (
                                                <span
                                                    key={instanceId}
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${ITEM_RARITY_COLORS[entry.item.rarity]}`}
                                                >
                                                    {entry.item.emoji} {t(entry.item.name)}
                                                    {(entry.enhanceLevel ?? 0) > 0 && (
                                                        <span className="text-amber-500">+{entry.enhanceLevel}</span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                        {selectedItems.size > 10 && (
                                            <span className="text-xs text-foreground/50">
                                                +{selectedItems.size - 10}{lang === 'ko' ? '개 더' : ' more'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setBulkSellConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('취소')}
                                </button>
                                <button
                                    onClick={handleBulkSellConfirm}
                                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Coins className="h-4 w-4" /> {t('판매')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 강화 모달 */}
            <EnhanceModal
                isOpen={enhanceModal.isOpen}
                onClose={() => setEnhanceModal({ isOpen: false, target: null, scrollId: '' })}
                target={enhanceModal.target}
                scrollId={enhanceModal.scrollId}
                onComplete={handleEnhanceComplete}
            />

            {/* 공유 시 로그인 필요 모달 */}
            <AnimatePresence>
                {showShareLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowShareLoginModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                        >
                            <div className="text-center mb-6">
                                <UserPlus className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                                <h3 className="text-xl font-black mb-2">{t('회원가입이 필요합니다')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {lang === 'ko'
                                        ? '친구에게 공유하려면 회원가입이 필요합니다.\n지금 가입하고 친구들과 함께 즐겨보세요!'
                                        : 'Sign up to share with friends.\nJoin now and enjoy with your friends!'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowShareLoginModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('닫기')}
                                </button>
                                <Link
                                    href="/signup"
                                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="h-4 w-4" /> {t('회원가입')}
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 링크 복사 완료 모달 */}
            <AnimatePresence>
                {showLinkCopiedModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowLinkCopiedModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-emerald-500"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <Copy className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black mb-2">{t('링크가 복사되었습니다!')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {lang === 'ko'
                                        ? '복사된 링크를 원하는 곳에 붙여넣기 하세요!'
                                        : 'Paste the copied link wherever you want!'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLinkCopiedModal(false)}
                                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
