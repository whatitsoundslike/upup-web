'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Shield, Star, Trophy, ArrowLeft,
    Heart, Skull, Zap, PawPrint, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { type Character, type GameItem, GAME_ITEMS, addItemToInventory, addExpToCharacter, DUNGEON_EXP, ITEM_RARITY_TEXT, loadCharacter, saveCharacter } from '../types';

interface MonsterDrop {
    itemId: string;
    chance: number; // 0~100%
}

interface DroppedItem {
    item: GameItem;
    quantity: number;
}

interface DungeonData {
    id: number;
    name: string;
    difficulty: '쉬움' | '보통' | '어려움';
    description: string;
    monsterName: string;
    monsterEmoji: string;
    monsterHp: number;
    monsterAttack: number;
    drops: MonsterDrop[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
    '쉬움': 'bg-green-500',
    '보통': 'bg-yellow-500',
    '어려움': 'bg-red-500',
};

const dungeons: DungeonData[] = [
    {
        id: 1,
        name: '고양이 골목',
        difficulty: '쉬움',
        description: '장난꾸러기 고양이들이 숨어있는 골목길',
        monsterName: '장난꾸러기 냥이',
        monsterEmoji: '🐱',
        monsterHp: 80,
        monsterAttack: 8,
        drops: [
            { itemId: 'potion', chance: 60 },
            { itemId: 'enhanced_feed', chance: 15 },
            { itemId: 'agility_feather', chance: 10 },
            { itemId: 'magic_snack', chance: 3 },
            { itemId: 'legend_necklace', chance: 100 },
            { itemId: 'iron_helmet', chance: 100 },
            { itemId: 'leather_armor', chance: 100 },
            { itemId: 'knight_helmet', chance: 100 },
        ],
    },
    {
        id: 2,
        name: '어둠의 숲',
        difficulty: '보통',
        description: '미스터리한 숲속에 강력한 적이 도사리고 있다',
        monsterName: '그림자 늑대',
        monsterEmoji: '🐺',
        monsterHp: 150,
        monsterAttack: 18,
        drops: [
            { itemId: 'potion', chance: 70 },
            { itemId: 'enhanced_feed', chance: 25 },
            { itemId: 'magic_snack', chance: 8 },
        ],
    },
    {
        id: 3,
        name: '드래곤 화산',
        difficulty: '어려움',
        description: '전설의 드래곤이 잠들어있는 화산',
        monsterName: '화염 드래곤',
        monsterEmoji: '🐉',
        monsterHp: 300,
        monsterAttack: 30,
        drops: [
            { itemId: 'potion', chance: 80 },
            { itemId: 'enhanced_feed', chance: 40 },
            { itemId: 'magic_snack', chance: 15 },
            { itemId: 'legend_necklace', chance: 0.05 },
        ],
    },
];

type BattleState = 'idle' | 'fighting' | 'won' | 'lost';

export default function Dungeon() {
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedDungeon, setSelectedDungeon] = useState<DungeonData | null>(null);
    const [battleState, setBattleState] = useState<BattleState>('idle');
    const [playerHp, setPlayerHp] = useState(0);
    const [monsterHp, setMonsterHp] = useState(0);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCharacter(loadCharacter());
    }, []);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [battleLog]);

    const startBattle = (dungeon: DungeonData) => {
        if (!character || character.currentHp <= 0) return;
        setSelectedDungeon(dungeon);
        const hp = character.currentHp > 0 && !isNaN(character.currentHp) ? character.currentHp : character.hp;
        setPlayerHp(hp);
        setMonsterHp(dungeon.monsterHp);
        setBattleState('fighting');
        setBattleLog([`${dungeon.monsterName}이(가) 나타났다!`]);
        setDroppedItems([]);
    };

    const handleAttack = useCallback(() => {
        if (battleState !== 'fighting' || !character || !selectedDungeon) return;

        // speed 기반 확률: 더블 어택 (최대 50%), 회피 (최대 40%)
        const doubleAttackChance = Math.min(character.speed / 200, 0.5);
        const dodgeChance = Math.min(character.speed / 250, 0.4);

        const newLog: string[] = [];

        // 1차 공격
        const playerDmg = Math.floor(character.attack * (0.8 + Math.random() * 0.4));
        let currentMonsterHp = Math.max(monsterHp - playerDmg, 0);
        newLog.push(`${character.name}의 공격! ${playerDmg} 데미지!`);

        // 더블 어택 판정
        if (currentMonsterHp > 0 && Math.random() < doubleAttackChance) {
            const bonusDmg = Math.floor(character.attack * (0.6 + Math.random() * 0.3));
            currentMonsterHp = Math.max(currentMonsterHp - bonusDmg, 0);
            newLog.push(`⚡ 빠른 연속 공격! ${bonusDmg} 추가 데미지!`);
        }

        setMonsterHp(currentMonsterHp);

        if (currentMonsterHp <= 0) {
            newLog.push(`${selectedDungeon.monsterName}을(를) 쓰러뜨렸다!`);
            // 각 아이템별 독립 확률 판정
            const drops: DroppedItem[] = [];
            for (const { itemId, chance } of selectedDungeon.drops) {
                if (Math.random() * 100 < chance) {
                    const item = GAME_ITEMS[itemId];
                    if (!item) continue;
                    addItemToInventory(itemId, 1);
                    drops.push({ item, quantity: 1 });
                }
            }
            if (drops.length > 0) {
                for (const drop of drops) {
                    newLog.push(`${drop.item.emoji} ${drop.item.name} 획득!`);
                }
            } else {
                newLog.push('드롭된 아이템이 없다...');
            }
            setDroppedItems(drops);
            const earnedExp = DUNGEON_EXP[selectedDungeon.difficulty] ?? 30;
            const { character: updated, leveledUp, levelsGained } = addExpToCharacter(earnedExp);
            // 남은 HP 저장
            updated.currentHp = playerHp;
            saveCharacter(updated);
            setCharacter(updated);
            newLog.push(`EXP +${earnedExp} 획득!`);
            if (leveledUp) {
                newLog.push(`레벨 업! Lv.${updated.level - levelsGained} → Lv.${updated.level}`);
            }
            setBattleLog((prev) => [...prev, ...newLog]);
            setBattleState('won');
            return;
        }

        // 회피 판정
        if (Math.random() < dodgeChance) {
            newLog.push(`💨 ${character.name}이(가) 재빠르게 회피했다!`);
        } else {
            const monsterDmg = Math.max(
                Math.floor(selectedDungeon.monsterAttack * (0.8 + Math.random() * 0.4) - character.defense * 0.3),
                1
            );
            const newPlayerHp = Math.max(playerHp - monsterDmg, 0);
            setPlayerHp(newPlayerHp);
            newLog.push(`${selectedDungeon.monsterName}의 반격! ${monsterDmg} 데미지!`);

            if (newPlayerHp <= 0) {
                newLog.push(`${character.name}이(가) 쓰러졌다...`);
                // 패배 시 HP 전체 회복
                const dead = { ...character, currentHp: 0 };
                saveCharacter(dead);
                setCharacter(dead);
                setBattleLog((prev) => [...prev, ...newLog]);
                setBattleState('lost');
                return;
            }
        }

        setBattleLog((prev) => [...prev, ...newLog]);
    }, [battleState, character, selectedDungeon, monsterHp, playerHp]);

    const exitBattle = () => {
        // 전투 중 도망 시 현재 HP 저장
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

    // 캐릭터 없을 때
    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <PawPrint className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black mb-3">캐릭터가 없습니다</h2>
                    <p className="text-foreground/60 mb-6">
                        던전에 도전하려면 먼저 캐릭터를 생성하세요!
                    </p>
                    <Link
                        href="/superpet"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                    >
                        <PawPrint className="h-5 w-5" />
                        캐릭터 만들러 가기
                    </Link>
                </motion.div>
            </div>
        );
    }

    // 배틀 화면
    if (selectedDungeon) {
        const playerHpPct = Math.max((playerHp / character.hp) * 100, 0);
        const monsterHpPct = Math.max((monsterHp / selectedDungeon.monsterHp) * 100, 0);

        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={exitBattle}
                    className="flex items-center gap-1 text-foreground/60 hover:text-foreground mb-8 text-sm font-semibold"
                >
                    <ArrowLeft className="h-4 w-4" /> 던전 목록으로
                </motion.button>

                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black mb-8 text-center"
                >
                    {selectedDungeon.name}
                </motion.h2>

                {/* 배틀 필드 */}
                <div className="relative grid grid-cols-2 gap-6 mb-8">
                    {/* VS 표시 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                    >
                        <span className="text-white font-black text-sm">VS</span>
                    </motion.div>
                    {/* 플레이어 */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-6 rounded-2xl bg-white/5"
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">🐾</div>
                            <h3 className="font-bold text-lg">{character.name}</h3>
                            <p className="text-xs text-foreground/50">{character.className}</p>
                        </div>
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5 text-red-500" /> HP
                            </span>
                            <span className="font-bold">{playerHp} / {character.hp}</span>
                        </div>
                        <div className="h-4 rounded-full bg-foreground/10 overflow-hidden">
                            <motion.div
                                animate={{ width: `${playerHpPct}%` }}
                                className="h-full rounded-full bg-green-500 transition-all duration-300"
                            />
                        </div>
                    </motion.div>

                    {/* 몬스터 */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-6 rounded-2xl bg-white/5"
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{selectedDungeon.monsterEmoji}</div>
                            <h3 className="font-bold text-lg">{selectedDungeon.monsterName}</h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${DIFFICULTY_COLORS[selectedDungeon.difficulty]}`}>
                                {selectedDungeon.difficulty}
                            </span>
                        </div>
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5 text-red-500" /> HP
                            </span>
                            <span className="font-bold">{monsterHp} / {selectedDungeon.monsterHp}</span>
                        </div>
                        <div className="h-4 rounded-full bg-foreground/10 overflow-hidden">
                            <motion.div
                                animate={{ width: `${monsterHpPct}%` }}
                                className="h-full rounded-full bg-red-500 transition-all duration-300"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* 배틀 로그 */}
                <div ref={logRef} className="glass p-4 rounded-xl bg-white/5 mb-6 h-40 overflow-y-auto">
                    {battleLog.map((log, i) => (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-foreground/70 py-1"
                        >
                            {log}
                        </motion.p>
                    ))}
                </div>

                {/* 액션 버튼 */}
                {battleState === 'fighting' && (
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAttack}
                            className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                        >
                            <Swords className="h-5 w-5" /> 공격!
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={exitBattle}
                            className="px-6 py-4 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                        >
                            도망치기
                        </motion.button>
                    </div>
                )}

                {/* 결과 오버레이 */}
                <AnimatePresence>
                    {battleState === 'won' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 glass p-8 rounded-2xl bg-white/5 text-center"
                        >
                            <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-black mb-2">승리!</h3>
                            <div className="mb-4">
                                <p className="text-foreground/60 text-sm mb-2 flex items-center justify-center gap-1">
                                    <Gift className="h-4 w-4" /> 획득 아이템
                                </p>
                                {droppedItems.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {droppedItems.map((drop) => (
                                            <span key={drop.item.id} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground/5 text-sm font-medium ${ITEM_RARITY_TEXT[drop.item.rarity]}`}>
                                                {drop.item.emoji} {drop.item.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-foreground/40 text-sm">드롭된 아이템이 없습니다</p>
                                )}
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={exitBattle}
                                    className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                                >
                                    다른 던전 도전하기
                                </button>
                                <Link
                                    href="/superpet/room"
                                    className="px-6 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    인벤토리 보기
                                </Link>
                            </div>
                        </motion.div>
                    )}
                    {battleState === 'lost' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-6 glass p-8 rounded-2xl bg-white/5 text-center"
                        >
                            <Skull className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-black mb-2">패배...</h3>
                            <p className="text-foreground/60 mb-4">다음에는 더 강해져서 돌아오자!</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => startBattle(selectedDungeon)}
                                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    다시 도전
                                </button>
                                <button
                                    onClick={exitBattle}
                                    className="px-6 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    던전 목록
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // 던전 목록
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tighter mb-3"
                >
                    던전 <span className="text-red-500">탐험</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-foreground/60"
                >
                    <span className="font-bold text-foreground">{character.name}</span> (Lv.{character.level} {character.className}) 으로 도전!
                </motion.p>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 text-sm"
                >
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-bold">{character.currentHp}</span>
                    <span className="text-foreground/40">/ {character.hp}</span>
                </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {dungeons.map((dungeon, idx) => (
                    <motion.div
                        key={dungeon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="glass p-6 rounded-2xl bg-white/5 shadow-lg flex flex-col"
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-3">{dungeon.monsterEmoji}</div>
                            <h3 className="text-lg font-bold mb-1">{dungeon.name}</h3>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-bold ${DIFFICULTY_COLORS[dungeon.difficulty]}`}>
                                {dungeon.difficulty}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/60 leading-relaxed mb-4 flex-1">
                            {dungeon.description}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-foreground/50 mb-4">
                            <Gift className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            {dungeon.drops.map((d) => {
                                const item = GAME_ITEMS[d.itemId];
                                return item ? <span key={d.itemId} title={`${d.chance}%`}>{item.emoji}</span> : null;
                            })}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startBattle(dungeon)}
                            className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                        >
                            <Swords className="h-4 w-4" /> 도전하기
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
