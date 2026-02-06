'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, PawPrint, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { type Character, GAME_ITEMS, addItemToInventory, addExpToCharacter, ITEM_RARITY_TEXT, ITEM_RARITY_BORDER, loadCharacter, saveCharacter, getTotalStats, useFood, loadInventory, type InventoryItem, type GameItem } from '../types';
import { getItem } from '../storage';
import { useDebouncedSave } from '../gameSync';
import { useLanguage } from '../i18n/LanguageContext';
import { type DungeonData, type MonsterData, type BattleState } from './dungeonData';
import DungeonSelect from './DungeonSelect';
import BattleScreen from './BattleScreen';
import { useAuth } from '@/components/AuthProvider';

interface DroppedItem {
    item: import('../types').GameItem;
    quantity: number;
}

export default function Dungeon() {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedDungeon, setSelectedDungeon] = useState<DungeonData | null>(null);
    const [selectedMonster, setSelectedMonster] = useState<MonsterData | null>(null);
    const [battleState, setBattleState] = useState<BattleState>('idle');
    const [playerHp, setPlayerHp] = useState(0);
    const [monsterHp, setMonsterHp] = useState(0);
    const [battleLog, setBattleLog] = useState<ReactNode[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
    const [lowHpWarning, setLowHpWarning] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [rareItemModal, setRareItemModal] = useState<GameItem | null>(null);
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const router = useRouter();
    const logRef = useRef<HTMLDivElement>(null);
    const battleFieldRef = useRef<HTMLDivElement>(null);
    const [isAttacking, setIsAttacking] = useState(false);
    const [showImpact, setShowImpact] = useState(false);
    const [impactKey, setImpactKey] = useState(0);
    const [attackDistance, setAttackDistance] = useState(100);
    const [feedCountdown, setFeedCountdown] = useState('');
    const debouncedSaveToServer = useDebouncedSave();

    useEffect(() => {
        setCharacter(loadCharacter());
        setInventory(loadInventory());
    }, []);

    const [navResetKey, setNavResetKey] = useState(0);

    useEffect(() => {
        const handleNavReset = (e: Event) => {
            if ((e as CustomEvent).detail === '/superpet/dungeon') {
                setNavResetKey(k => k + 1);
            }
        };
        window.addEventListener('nav-reset', handleNavReset);
        return () => window.removeEventListener('nav-reset', handleNavReset);
    }, []);

    useEffect(() => {
        if (navResetKey > 0) exitBattle();
    }, [navResetKey]);

    useEffect(() => {
        const FEED_INTERVAL = 30 * 60 * 1000;
        const update = () => {
            const last = Number(getItem('last-feed-time') || Date.now());
            const remaining = Math.max(0, FEED_INTERVAL - (Date.now() - last));
            const min = Math.floor(remaining / 60000);
            const sec = Math.floor((remaining % 60000) / 1000);
            setFeedCountdown(`${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [battleLog]);

    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => setActiveToast(null), 2400);
        return () => clearTimeout(timer);
    }, [activeToast]);

    // 배틀 필드 너비에 비례하여 돌진 거리 계산
    useEffect(() => {
        const update = () => {
            if (battleFieldRef.current) {
                const w = battleFieldRef.current.offsetWidth;
                setAttackDistance(Math.floor((w - 48) / 2 * 0.4));
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [selectedDungeon]);

    const showToast = (message: string, tone: 'success' | 'error') => {
        setActiveToast({ message, tone, key: Date.now() });
    };

    const handleUseFood = (itemId: string) => {
        const result = useFood(itemId);
        if (result.success) {
            const updated = loadCharacter();
            if (updated) {
                setCharacter(updated);
                setPlayerHp(updated.currentHp);
            }
            setInventory(loadInventory());

            const msg = lang === 'ko'
                ? `${result.itemName}을(를) 사용하여 HP ${result.hpRecovered} 회복했습니다!`
                : `Used ${t(result.itemName!)} to recover ${result.hpRecovered} HP!`;
            showToast(msg, 'success');
            debouncedSaveToServer();
        } else {
            showToast(t(result.message), 'error');
        }
    };

    // 몬스터 랜덤 선택 함수
    const selectRandomMonster = (dungeon: DungeonData): MonsterData => {
        const totalChance = dungeon.monsters.reduce((sum, m) => sum + m.spawnChance, 0);
        let random = Math.random() * totalChance;

        for (const monster of dungeon.monsters) {
            random -= monster.spawnChance;
            if (random <= 0) {
                return monster;
            }
        }

        return dungeon.monsters[0];
    };

    const startBattle = (dungeon: DungeonData) => {
        if (!character) return;

        // 비로그인 상태에서는 회원가입 유도
        if (!user) {
            setShowSignupModal(true);
            return;
        }

        if (character.currentHp <= 0) {
            setLowHpWarning(true);
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const monster = selectRandomMonster(dungeon);

        setSelectedDungeon(dungeon);
        setSelectedMonster(monster);

        const totalStats = getTotalStats(character);
        const maxHp = totalStats.hp;

        const hp = Math.min(
            character.currentHp > 0 && !isNaN(character.currentHp) ? character.currentHp : maxHp,
            maxHp
        );

        setPlayerHp(hp);
        setMonsterHp(monster.hp);
        setBattleState('fighting');
        setBattleLog([
            `${t(monster.name)}${monster.isBoss ? ` (${t('보스')})` : ''}${t('이(가) 나타났다!')}`,
            `LV.${monster.level} | HP ${monster.hp} | ${t('공격력')} ${monster.attack}`
        ]);
        setDroppedItems([]);
    };

    const handleAttack = useCallback(() => {
        if (battleState !== 'fighting' || !character || !selectedDungeon || !selectedMonster) return;

        setIsAttacking(true);
        setTimeout(() => {
            setImpactKey(k => k + 1);
            setShowImpact(true);
            setTimeout(() => setShowImpact(false), 500);
        }, 250);
        setTimeout(() => setIsAttacking(false), 550);

        const totalStats = getTotalStats(character);

        const doubleAttackChance = Math.min(totalStats.speed / 500, 0.5);
        const dodgeChance = Math.min(totalStats.speed / 500, 0.4);

        const newLog: ReactNode[] = [];

        const playerDmg = Math.floor(totalStats.attack * (0.8 + Math.random() * 0.4));
        let currentMonsterHp = Math.max(monsterHp - playerDmg, 0);
        newLog.push(`${character.name}${t('의 공격!')} ${playerDmg} ${t('데미지!')}`);

        if (currentMonsterHp > 0 && Math.random() < doubleAttackChance) {
            const bonusDmg = Math.floor(totalStats.attack * (0.6 + Math.random() * 0.3));
            currentMonsterHp = Math.max(currentMonsterHp - bonusDmg, 0);
            newLog.push(`⚡ ${t('빠른 연속 공격!')} ${bonusDmg} ${t('추가 데미지!')}`);
        }

        setMonsterHp(currentMonsterHp);

        if (currentMonsterHp <= 0) {
            newLog.push(`${t(selectedMonster.name)}${t('을(를) 쓰러뜨렸다!')}`);
            const drops: DroppedItem[] = [];
            for (const { itemId, chance } of selectedMonster.drops) {
                if (Math.random() * 100 < chance) {
                    const item = GAME_ITEMS[itemId];
                    if (!item) continue;
                    addItemToInventory(itemId, 1);
                    drops.push({ item, quantity: 1 });
                }
            }
            if (drops.length > 0) {
                for (const drop of drops) {
                    newLog.push(
                        <span key={`drop-${drop.item.id}-${Date.now()}`}>
                            {drop.item.emoji} <span className={ITEM_RARITY_TEXT[drop.item.rarity]}>{t(drop.item.name)}</span> {t('획득!')}
                        </span>
                    );
                }
                // 희귀 등급 이상의 장비/주문서 획득 시 축하 모달
                const rareDrops = ['희귀', '에픽', '전설'];
                const rareItem = drops.find(d =>
                    rareDrops.includes(d.item.rarity) &&
                    (d.item.type === 'equipment' || d.item.type === 'scroll')
                );
                if (rareItem) {
                    setTimeout(() => setRareItemModal(rareItem.item), 500);
                }
            } else {
                newLog.push(t('드롭된 아이템이 없다...'));
            }
            setDroppedItems(drops);
            const earnedExp = selectedMonster.level * 10 + (selectedMonster.isBoss ? 50 : 0);
            const baseGold = selectedMonster.level * 5 + (selectedMonster.isBoss ? 50 : 0);
            const earnedGold = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
            const { character: updated, leveledUp, levelsGained } = addExpToCharacter(earnedExp);

            updated.currentHp = playerHp;
            updated.gold += earnedGold;
            saveCharacter(updated);
            setCharacter(updated);
            setInventory(loadInventory());
            newLog.push(`💰 ${earnedGold}G ${lang === 'ko' ? '획득!' : 'earned!'}`);
            newLog.push(`EXP +${earnedExp} ${lang === 'ko' ? '획득!' : 'earned!'}`);
            if (leveledUp) {
                newLog.push(`${t('레벨 업!')} Lv.${updated.level - levelsGained} → Lv.${updated.level}`);
            }
            setBattleLog((prev) => [...prev, ...newLog]);
            setBattleState('won');
            debouncedSaveToServer();
            return;
        }

        if (Math.random() < dodgeChance) {
            newLog.push(`💨 ${character.name}${t('이(가) 재빠르게 회피했다!')}`);
        } else {
            const monsterDmg = Math.max(
                Math.floor((selectedMonster.attack - totalStats.defense) * (0.8 + Math.random() * 0.4)),
                5
            );
            const newPlayerHp = Math.max(playerHp - monsterDmg, 0);
            setPlayerHp(newPlayerHp);
            newLog.push(`${t(selectedMonster.name)}${t('의 반격!')} ${monsterDmg} ${t('데미지!')}`);

            if (newPlayerHp <= 0) {
                newLog.push(`${character.name}${t('이(가) 쓰러졌다...')}`);
                const dead = { ...character, currentHp: 0 };
                saveCharacter(dead);
                setCharacter(dead);
                setBattleLog((prev) => [...prev, ...newLog]);
                setBattleState('lost');
                debouncedSaveToServer();
                return;
            }
        }

        setBattleLog((prev) => [...prev, ...newLog]);
    }, [battleState, character, selectedDungeon, monsterHp, playerHp, t, lang, selectedMonster]);

    // 자동 전투 인터벌
    useEffect(() => {
        if (battleState !== 'fighting') return;
        const interval = setInterval(() => {
            handleAttack();
        }, 1000);
        return () => clearInterval(interval);
    }, [battleState, handleAttack]);

    const exitBattle = () => {
        if (battleState === 'fighting' && character) {
            const updated = { ...character, currentHp: playerHp };
            saveCharacter(updated);
            setCharacter(updated);
        }
        setSelectedDungeon(null);
        setBattleState('idle');
        setBattleLog([]);
        setDroppedItems([]);
    };

    return (
        <div className="w-full">
            {!character ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <PawPrint className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-black mb-3">{t('캐릭터가 없습니다')}</h2>
                        <p className="text-foreground/60 mb-6">
                            {t('던전에 도전하려면 먼저 캐릭터를 생성하세요!')}
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
            ) : selectedDungeon && selectedMonster ? (
                <BattleScreen
                    character={character}
                    selectedDungeon={selectedDungeon}
                    selectedMonster={selectedMonster}
                    battleState={battleState}
                    playerHp={playerHp}
                    monsterHp={monsterHp}
                    battleLog={battleLog}
                    inventory={inventory}
                    isAttacking={isAttacking}
                    showImpact={showImpact}
                    impactKey={impactKey}
                    attackDistance={attackDistance}
                    battleFieldRef={battleFieldRef}
                    logRef={logRef}
                    feedCountdown={feedCountdown}
                    onStartBattle={startBattle}
                    onExitBattle={exitBattle}
                    onUseFood={handleUseFood}
                />
            ) : (
                <DungeonSelect
                    character={character}
                    feedCountdown={feedCountdown}
                    onStartBattle={startBattle}
                />
            )}

            {/* 체력 부족 경고 모달 */}
            <AnimatePresence>
                {lowHpWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setLowHpWarning(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-red-500"
                        >
                            <div className="text-center mb-6">
                                <Heart className="h-16 w-16 text-red-500 mx-auto mb-3" />
                                <h3 className="text-xl font-black mb-2">{t('체력이 부족합니다!')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {t('던전에 도전하려면 체력이 필요합니다.')}<br />
                                    {t('인벤토리에서 회복 아이템을 사용하세요.')}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setLowHpWarning(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('닫기')}
                                </button>
                                <Link
                                    href="/superpet/room"
                                    className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Heart className="h-4 w-4" /> {t('인벤토리')}
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 회원가입 유도 모달 */}
            <AnimatePresence>
                {showSignupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowSignupModal(false)}
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
                                    {t('전투 데이터를 저장하려면 회원가입이 필요합니다.')}<br />
                                    {t('지금 가입하고 게임을 즐겨보세요!')}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSignupModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('닫기')}
                                </button>
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="h-4 w-4" /> {t('회원가입')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 희귀 아이템 획득 축하 모달 */}
            <AnimatePresence>
                {rareItemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                        onClick={() => setRareItemModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-4 ${ITEM_RARITY_BORDER[rareItemModal.rarity]}`}
                        >
                            {/* 배경 이펙트 */}
                            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-transparent via-amber-500/10 to-transparent"
                                />
                            </div>

                            <div className="relative text-center">
                                {/* 축하 아이콘 */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                                    className="mb-4"
                                >
                                    <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                                </motion.div>

                                {/* 축하 메시지 */}
                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-black mb-4"
                                >
                                    {lang === 'ko' ? '🎉 레어 아이템 획득!' : '🎉 Rare Item Drop!'}
                                </motion.h3>

                                {/* 아이템 표시 */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6"
                                >
                                    <div className="text-6xl mb-3">{rareItemModal.emoji}</div>
                                    <p className={`text-lg font-bold ${ITEM_RARITY_TEXT[rareItemModal.rarity]}`}>
                                        {t(rareItemModal.name)}
                                    </p>
                                    <p className={`text-sm font-semibold ${ITEM_RARITY_TEXT[rareItemModal.rarity]}`}>
                                        [{t(rareItemModal.rarity)}]
                                    </p>

                                    {/* 스탯 표시 */}
                                    {rareItemModal.type === 'equipment' && (
                                        <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-foreground/60">
                                            {rareItemModal.stats.hp > 0 && <span>HP+{rareItemModal.stats.hp}</span>}
                                            {rareItemModal.stats.attack > 0 && <span>{t('공격')}+{rareItemModal.stats.attack}</span>}
                                            {rareItemModal.stats.defense > 0 && <span>{t('방어')}+{rareItemModal.stats.defense}</span>}
                                            {rareItemModal.stats.speed > 0 && <span>{t('속도')}+{rareItemModal.stats.speed}</span>}
                                        </div>
                                    )}
                                </motion.div>

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={() => setRareItemModal(null)}
                                    className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                                >
                                    {t('확인')}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 토스트 알림 */}
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
                            className={`w-full max-w-sm rounded-full px-4 py-3 text-sm font-semibold shadow-lg text-center ${activeToast.tone === 'success'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                                }`}
                        >
                            {activeToast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
