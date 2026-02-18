'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Swords, Coins, Gem, X, Heart, Shield, Zap, Gauge, Sword, Feather, Loader2, UserPlus, Copy, CheckSquare, Square, Trash2, Hammer } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    type InventoryItem,
    type Character,
    type GameItem,
    type EquipmentSlot,
    type EnhanceResult,
    type EnhanceScrollType,
    type ItemRarity,
    ITEM_RARITY_COLORS,
    ITEM_RARITY_BORDER,
    ITEM_RARITY_TEXT,
    ITEM_SELL_PRICE,
    RARITY_TO_POWDER,
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
    addItemToInventory,
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

const TYPE_FILTER_OPTIONS: { key: string; label: string; emoji: string }[] = [
    { key: 'all', label: '전체', emoji: '📦' },
    { key: 'equipment', label: '장비', emoji: '⚔️' },
    { key: 'food', label: '소모품', emoji: '🥫' },
    { key: 'scroll', label: '주문서', emoji: '📜' },
    { key: 'material', label: '재료', emoji: '✨' },
];

const LEFT_EQUIP_SLOTS: EquipmentSlot[] = ['투구', '망토', '무기', '부츠'];
const RIGHT_EQUIP_SLOTS: EquipmentSlot[] = ['갑옷', '장갑', '방패', '목걸이', '반지'];
const SLOT_ICONS: Record<EquipmentSlot, string> = {
    '투구': '🪖', '갑옷': '🛡️', '망토': '🧣', '무기': '⚔️', '방패': '🔰',
    '장갑': '🧤', '부츠': '👢', '목걸이': '📿', '반지': '💍',
};

export default function Room() {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [character, setCharacter] = useState<Character | null>(null);
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const [sellConfirm, setSellConfirm] = useState<{ itemId: string; sellAll: boolean; instanceId?: string } | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isSharing, setIsSharing] = useState(false);
    const [charInfoTab, setCharInfoTab] = useState<'equipment' | 'stats'>('equipment');
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
    const [bulkDisassembleConfirm, setBulkDisassembleConfirm] = useState(false);

    // 분해 확인 모달
    const [disassembleConfirm, setDisassembleConfirm] = useState<InventoryItem | null>(null);

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

    const handleSellRequest = (itemId: string, sellAll: boolean, instanceId?: string) => {
        setSellConfirm({ itemId, sellAll, instanceId });
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

    // 장비 분해 - 등급에 맞는 가루 획득
    const handleDisassemble = () => {
        if (!disassembleConfirm) return;

        const item = disassembleConfirm.item;

        if (item.type !== 'equipment') {
            setDisassembleConfirm(null);
            return;
        }

        // 등급별 가루 아이템 ID
        const powderId = RARITY_TO_POWDER[item.rarity];
        const powderItem = GAME_ITEMS[powderId];

        // 인벤토리에서 장비 제거
        const updated = inventory.filter((e) => e.instanceId !== disassembleConfirm.instanceId);
        setInventory(updated);
        saveInventory(updated);

        // 가루 추가 (1개)
        addItemToInventory(powderId, 1);
        setInventory(loadInventory());

        showToast(
            lang === 'ko'
                ? `${item.name}을(를) 분해하여 ${powderItem?.name ?? powderId} 1개를 획득했습니다!`
                : `Disassembled ${t(item.name)} and obtained 1x ${t(powderItem?.name ?? powderId)}!`,
            'success'
        );

        setSelectedItem(null);
        setDisassembleConfirm(null);
        debouncedSaveToServer();
    };

    // 일괄 분해 - 등급별 가루 획득
    const handleBulkDisassemble = () => {
        if (selectedItems.size === 0) return;

        // 등급별 가루 개수 집계
        const powderCounts: Record<ItemRarity, number> = {
            '일반': 0, '고급': 0, '희귀': 0, '에픽': 0, '전설': 0
        };

        const updated = inventory.filter((e) => {
            if (e.instanceId && selectedItems.has(e.instanceId) && e.item.type === 'equipment') {
                powderCounts[e.item.rarity]++;
                return false;
            }
            return true;
        });

        setInventory(updated);
        saveInventory(updated);

        // 각 등급 가루 추가
        let totalPowder = 0;
        for (const [rarity, count] of Object.entries(powderCounts) as [ItemRarity, number][]) {
            if (count > 0) {
                const powderId = RARITY_TO_POWDER[rarity];
                addItemToInventory(powderId, count);
                totalPowder += count;
            }
        }

        setInventory(loadInventory());

        showToast(
            lang === 'ko'
                ? `${selectedItems.size}개의 장비를 분해하여 가루 ${totalPowder}개를 획득했습니다!`
                : `Disassembled ${selectedItems.size} items and obtained ${totalPowder}x powder!`,
            'success'
        );

        setSelectedItems(new Set());
        setBulkSelectMode(false);
        setBulkDisassembleConfirm(false);
        debouncedSaveToServer();
    };

    const handleSellConfirm = () => {
        if (!sellConfirm) return;
        const { itemId, sellAll, instanceId } = sellConfirm;

        if (sellAll) {
            // 전부 판매: instanceId가 있으면 같은 item.id를 가진 모든 장비 판매
            const entries = instanceId
                ? inventory.filter((e) => e.item.id === itemId)
                : [inventory.find((e) => e.item.id === itemId)].filter(Boolean);
            if (entries.length === 0) return;
            const totalQuantity = entries.reduce((sum, e) => sum + (e?.quantity || 0), 0);
            const gold = ITEM_SELL_PRICE[entries[0]!.item.rarity] * totalQuantity;
            const updated = inventory.filter((e) => e.item.id !== itemId);
            setInventory(updated);
            saveInventory(updated);
            const updatedChar = addGoldToCharacter(gold);
            setCharacter(updatedChar);
            setSelectedItem(null);
            showToast(
                lang === 'ko'
                    ? `${entries[0]!.item.name} ${totalQuantity}개를 ${gold}G에 판매했습니다!`
                    : `Sold ${totalQuantity}x ${t(entries[0]!.item.name)} for ${gold}G!`,
                'success'
            );
        } else {
            // 1개 판매: instanceId가 있으면 해당 장비만 판매
            const entry = instanceId
                ? inventory.find((e) => e.instanceId === instanceId)
                : inventory.find((e) => e.item.id === itemId);
            if (!entry || entry.quantity <= 0) return;
            const gold = ITEM_SELL_PRICE[entry.item.rarity];

            let updated;
            if (instanceId) {
                // 장비 아이템: instanceId로 특정 아이템만 제거
                updated = inventory.filter((e) => e.instanceId !== instanceId);
            } else {
                // 소모품/재료: 수량 감소
                updated = inventory
                    .map((e) =>
                        e.item.id === itemId
                            ? { ...e, quantity: e.quantity - 1 }
                            : e
                    )
                    .filter((e) => e.quantity > 0);
            }

            setInventory(updated);
            saveInventory(updated);
            const updatedChar = addGoldToCharacter(gold);
            setCharacter(updatedChar);

            if (instanceId) {
                // 장비: 같은 종류의 다른 장비가 있으면 선택
                const remaining = updated.find((e) => e.item.id === itemId);
                setSelectedItem(remaining ?? null);
            } else if (selectedItem?.item.id === itemId) {
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

    const filteredInventory = inventory.filter((entry) => {
        if (typeFilter !== 'all' && entry.item.type !== typeFilter) return false;
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-2 lg:p-12">
            {/* 캐릭터 정보 (탭: 장비 정보 / 캐릭터 정보) */}
            {character && (() => {
                const nextExp = getExpForNextLevel(character.level);
                const expPct = Math.min((character.exp / nextExp) * 100, 100);
                const equipmentStats = calculateEquipmentStats(character);

                const renderEquipSlot = (slot: EquipmentSlot) => {
                    const equipped = character.equipment[slot];
                    const item = equipped?.item;
                    const enhanceLevel = equipped?.enhanceLevel ?? 0;

                    return (
                        <button
                            key={slot}
                            onClick={() => {
                                if (item && equipped) {
                                    const inventoryFormat: InventoryItem = {
                                        item,
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
                            className={`relative w-15 h-15 md:w-16 md:h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                                item
                                    ? ITEM_RARITY_BORDER[item.rarity] + ' bg-black/20 dark:bg-black/40 hover:scale-110 cursor-pointer'
                                    : 'border-foreground/15 bg-foreground/5 cursor-default'
                            }`}
                            title={t(slot)}
                        >
                            <span className={item ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl opacity-30'}>
                                {item?.emoji ?? SLOT_ICONS[slot]}
                            </span>
                            {item && enhanceLevel > 0 && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-amber-400 font-bold bg-black/70 px-1 rounded">
                                    +{enhanceLevel}
                                </span>
                            )}
                        </button>
                    );
                };

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-xl bg-white/5 shadow-xl border border-foreground/10 overflow-hidden mb-6"
                    >
                        {/* Tabs */}
                        <div className="flex border-b border-foreground/10">
                            <button
                                onClick={() => setCharInfoTab('equipment')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                                    charInfoTab === 'equipment'
                                        ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5'
                                        : 'text-foreground/40 hover:text-foreground/60'
                                }`}
                            >
                                {t('장비 정보')}
                            </button>
                            <button
                                onClick={() => setCharInfoTab('stats')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                                    charInfoTab === 'stats'
                                        ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5'
                                        : 'text-foreground/40 hover:text-foreground/60'
                                }`}
                            >
                                {t('캐릭터 정보')}
                            </button>
                        </div>

                        <div className="p-4 md:p-5">
                            {charInfoTab === 'equipment' ? (
                                /* 장비 탭 - 리니지 스타일 좌우 배치 */
                                <div className="flex items-center justify-center gap-2 md:gap-4">
                                    {/* Left: 투구, 망토, 무기, 부츠 */}
                                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                                        {LEFT_EQUIP_SLOTS.map(slot => (
                                            <div key={slot} className="flex flex-col items-center">
                                                {renderEquipSlot(slot)}
                                                <span className="text-[12px] md:text-[14px] text-foreground/30 mt-0.5">{t(slot)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Center: 캐릭터 이미지 */}
                                    <div className="flex flex-col items-center flex-shrink-0 mx-1 md:mx-3">
                                        {character.image ? (
                                            <img
                                                src={character.image}
                                                alt={character.name}
                                                className="w-28 h-44 md:w-36 md:h-56 object-cover rounded-xl border-2 border-amber-500/60 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-28 h-44 md:w-36 md:h-56 rounded-xl border-2 border-amber-500/60 bg-foreground/5 flex items-center justify-center text-5xl shadow-lg">
                                                🐾
                                            </div>
                                        )}
                                        <h3 className="font-bold mt-2 text-sm md:text-base">{character.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                                Lv.{character.level}
                                            </span>
                                            <span className="text-[10px] md:text-xs text-foreground/50">{t(character.className)}</span>
                                        </div>
                                    </div>

                                    {/* Right: 갑옷, 장갑, 방패, 목걸이, 반지 */}
                                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                                        {RIGHT_EQUIP_SLOTS.map(slot => (
                                            <div key={slot} className="flex flex-col items-center">
                                                {renderEquipSlot(slot)}
                                                <span className="text-[9px] md:text-[10px] text-foreground/30 mt-0.5">{t(slot)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* 캐릭터 정보 탭 - 레벨, 경험치, 스탯, 재화 */
                                <div>
                                    {/* 캐릭터 요약 */}
                                    <div className="flex items-center gap-3 mb-4">
                                        {character.image ? (
                                            <img src={character.image} alt={character.name} className="w-12 h-12 object-cover rounded-lg border border-amber-500" />
                                        ) : (
                                            <div className="text-2xl">🐾</div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">{character.name}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                                                    Lv.{character.level}
                                                </span>
                                            </div>
                                            <p className="text-xs text-foreground/50">{t(character.className)} / {t(character.element)}</p>
                                        </div>
                                    </div>

                                    {/* 경험치 바 */}
                                    <div className="mb-4">
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

                                    {/* 스탯 */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {(Object.entries(STAT_ICONS) as [keyof typeof STAT_ICONS, (typeof STAT_ICONS)[keyof typeof STAT_ICONS]][]).map(([key, { icon: Icon, color }]) => {
                                            const bonus = equipmentStats[key];
                                            const baseValue = character[key];
                                            return (
                                                <div key={key} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground/5">
                                                    <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                                                    <span className="text-xs text-foreground/50">
                                                        {key === 'hp' ? 'HP' : key === 'attack' ? t('공격') : key === 'defense' ? t('방어') : t('속도')}
                                                    </span>
                                                    <span className="ml-auto font-bold text-sm">
                                                        {key === 'hp' ? `${character.currentHp}/${character.hp + bonus}` : baseValue}
                                                    </span>
                                                    {bonus > 0 && (
                                                        <span className="text-xs text-emerald-500 font-bold">+{bonus}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* 재화 */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-sm">
                                            <Coins className="h-4 w-4 text-amber-500" />
                                            <span className="font-bold text-amber-600">{character.gold.toLocaleString()}</span>
                                            <span className="text-foreground/40 text-xs">{t('골드')}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 text-sm">
                                            <Gem className="h-4 w-4 text-purple-500" />
                                            <span className="font-bold text-purple-600">
                                                {(user && gemBalance !== null ? gemBalance : character.gem).toLocaleString()}
                                            </span>
                                            <span className="text-foreground/40 text-xs">{t('젬')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 공유 버튼 */}
                            <div className="mt-4 flex gap-2">
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
                        </div>
                    </motion.div>
                );
            })()}

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
                    {/* 타입 필터 칩 */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                        {TYPE_FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setTypeFilter(opt.key)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                                    typeFilter === opt.key
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
                                }`}
                            >
                                <span>{opt.emoji}</span>
                                {t(opt.label)}
                            </button>
                        ))}
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
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setBulkSelectMode(true)}
                                    className="px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-sm font-semibold hover:bg-foreground/10 transition-colors flex items-center gap-2"
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    {t('일괄 선택')}
                                </button>
                                <Link
                                    href="/superpet/craft"
                                    className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-sm font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-2 text-purple-400"
                                >
                                    <Hammer className="h-4 w-4" />
                                    {t('아이템 제작')}
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* 아이템 그리드 */}
            {inventory.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
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
                                                    {/* 분해 버튼 - 장착 중이 아닌 경우 */}
                                                    {!isEquipped && (() => {
                                                        const powderId = RARITY_TO_POWDER[modalItem.rarity];
                                                        const powderItem = GAME_ITEMS[powderId];
                                                        return (
                                                            <button
                                                                onClick={() => setDisassembleConfirm(selectedItem)}
                                                                className="w-full py-3 rounded-xl bg-orange-500/10 text-orange-600 font-bold hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Hammer className="h-4 w-4" />
                                                                {t('분해하기')} ({t(powderItem?.name ?? '')} 1{lang === 'ko' ? '개' : 'x'})
                                                            </button>
                                                        );
                                                    })()}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {selectedItem.quantity > 0 && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSellRequest(selectedItem.item.id, false, selectedItem.instanceId)}
                                                className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-600 font-semibold text-sm hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Coins className="h-4 w-4" /> {t('1개 판매')} ({ITEM_SELL_PRICE[modalItem.rarity]}G)
                                            </button>
                                            {selectedItem.quantity > 1 && (
                                                <button
                                                    onClick={() => handleSellRequest(selectedItem.item.id, true, selectedItem.instanceId)}
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
                    const entry = sellConfirm.instanceId
                        ? inventory.find((e) => e.instanceId === sellConfirm.instanceId)
                        : inventory.find((e) => e.item.id === sellConfirm.itemId);
                    if (!entry) return null;
                    // 전부 판매 시 같은 item.id를 가진 모든 아이템의 수량 합계
                    const totalQuantity = sellConfirm.sellAll
                        ? inventory.filter((e) => e.item.id === sellConfirm.itemId).reduce((sum, e) => sum + e.quantity, 0)
                        : 1;
                    const totalGold = ITEM_SELL_PRICE[entry.item.rarity] * totalQuantity;
                    const quantityText = `${totalQuantity}${lang === 'ko' ? '개' : 'x'}`;

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

            {/* 일괄 분해 확인 모달 */}
            <AnimatePresence>
                {bulkDisassembleConfirm && selectedItems.size > 0 && (() => {
                    // 등급별 가루 개수 미리보기
                    const powderPreview: Record<ItemRarity, number> = {
                        '일반': 0, '고급': 0, '희귀': 0, '에픽': 0, '전설': 0
                    };
                    for (const instanceId of selectedItems) {
                        const entry = inventory.find((e) => e.instanceId === instanceId);
                        if (entry && entry.item.type === 'equipment') {
                            powderPreview[entry.item.rarity]++;
                        }
                    }

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                            onClick={() => setBulkDisassembleConfirm(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-orange-500"
                            >
                                <div className="text-center mb-6">
                                    <Hammer className="h-16 w-16 text-orange-500 mx-auto mb-3" />
                                    <h3 className="text-xl font-black mb-2">{t('일괄 분해')}</h3>
                                    <p className="text-sm text-foreground/60 mb-4">
                                        {lang === 'ko' ? (
                                            <>
                                                선택한 <span className="font-bold text-foreground">{selectedItems.size}개</span>의 장비를 분해합니다
                                            </>
                                        ) : (
                                            <>
                                                Disassemble <span className="font-bold text-foreground">{selectedItems.size} items</span>
                                            </>
                                        )}
                                    </p>
                                    {/* 획득 예정 가루 */}
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {(Object.entries(powderPreview) as [ItemRarity, number][])
                                            .filter(([, count]) => count > 0)
                                            .map(([rarity, count]) => {
                                                const powderId = RARITY_TO_POWDER[rarity];
                                                const powderItem = GAME_ITEMS[powderId];
                                                return (
                                                    <span
                                                        key={rarity}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${ITEM_RARITY_COLORS[rarity]}`}
                                                    >
                                                        {powderItem?.emoji} {t(powderItem?.name ?? '')} x{count}
                                                    </span>
                                                );
                                            })}
                                    </div>
                                    <p className="text-xs text-red-500 mt-3">
                                        {lang === 'ko' ? '⚠️ 분해된 장비는 복구할 수 없습니다!' : '⚠️ Disassembled items cannot be recovered!'}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setBulkDisassembleConfirm(false)}
                                        className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                    >
                                        {t('취소')}
                                    </button>
                                    <button
                                        onClick={handleBulkDisassemble}
                                        className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Hammer className="h-4 w-4" /> {t('분해')}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* 분해 확인 모달 */}
            <AnimatePresence>
                {disassembleConfirm && (() => {
                    const item = disassembleConfirm.item;
                    const enhanceLevel = disassembleConfirm.enhanceLevel ?? 0;
                    const powderId = RARITY_TO_POWDER[item.rarity];
                    const powderItem = GAME_ITEMS[powderId];

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                            onClick={() => setDisassembleConfirm(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-orange-500"
                            >
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">{item.emoji}</div>
                                    <h3 className="text-xl font-black mb-2">{t('장비 분해')}</h3>
                                    <p className="text-sm text-foreground/60">
                                        {lang === 'ko' ? (
                                            <>
                                                <span className="font-bold text-foreground">{item.name}{enhanceLevel > 0 ? ` +${enhanceLevel}` : ''}</span>을(를) 분해하면<br />
                                                <span className={`inline-flex items-center gap-1 font-bold ${ITEM_RARITY_TEXT[item.rarity]}`}>
                                                    {powderItem?.emoji} {powderItem?.name} 1개
                                                </span>를 획득합니다
                                            </>
                                        ) : (
                                            <>
                                                Disassemble <span className="font-bold text-foreground">{t(item.name)}{enhanceLevel > 0 ? ` +${enhanceLevel}` : ''}</span><br />
                                                to obtain <span className={`inline-flex items-center gap-1 font-bold ${ITEM_RARITY_TEXT[item.rarity]}`}>
                                                    {powderItem?.emoji} 1x {t(powderItem?.name ?? '')}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-red-500 mt-2">
                                        {lang === 'ko' ? '⚠️ 분해된 장비는 복구할 수 없습니다!' : '⚠️ Disassembled equipment cannot be recovered!'}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDisassembleConfirm(null)}
                                        className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                    >
                                        {t('취소')}
                                    </button>
                                    <button
                                        onClick={handleDisassemble}
                                        className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Hammer className="h-4 w-4" /> {t('분해')}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
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

            {/* 일괄 선택 하단 플로팅 바 */}
            <AnimatePresence>
                {bulkSelectMode && selectedItems.size > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-[70px] left-0 right-0 z-50 px-4 pb-2 pt-3 bg-gradient-to-t from-background via-background to-transparent md:bottom-0 md:pb-4"
                    >
                        <div className="max-w-2xl mx-auto flex gap-2">
                            <button
                                onClick={() => setBulkDisassembleConfirm(true)}
                                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                            >
                                <Hammer className="h-4 w-4" />
                                {selectedItems.size}{lang === 'ko' ? '개 분해' : ' Disassemble'}
                            </button>
                            <button
                                onClick={() => setBulkSellConfirm(true)}
                                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                            >
                                <Coins className="h-4 w-4" />
                                {selectedItems.size}{lang === 'ko' ? '개 판매' : ' Sell'} ({getSelectedItemsTotal()}G)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
