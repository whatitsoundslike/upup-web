'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Shield, Star, Trophy, ArrowLeft,
    Heart, Skull, Zap, PawPrint, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { type Character, GAME_ITEMS, addItemToInventory } from '../types';

interface RewardDrop {
    itemId: string;
    quantity: number;
}

interface DungeonData {
    id: number;
    name: string;
    difficulty: '쉬움' | '보통' | '어려움';
    description: string;
    reward: string;
    rewards: RewardDrop[];
    monsterName: string;
    monsterEmoji: string;
    monsterHp: number;
    monsterAttack: number;
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
        reward: '뼈다귀 x3, 회복 포션 x1',
        rewards: [
            { itemId: 'bone', quantity: 3 },
            { itemId: 'potion', quantity: 1 },
        ],
        monsterName: '장난꾸러기 냥이',
        monsterEmoji: '🐱',
        monsterHp: 80,
        monsterAttack: 8,
    },
    {
        id: 2,
        name: '어둠의 숲',
        difficulty: '보통',
        description: '미스터리한 숲속에 강력한 적이 도사리고 있다',
        reward: '마법 간식 x1, 수호의 부적 x1',
        rewards: [
            { itemId: 'magic_snack', quantity: 1 },
            { itemId: 'shield_charm', quantity: 1 },
        ],
        monsterName: '그림자 늑대',
        monsterEmoji: '🐺',
        monsterHp: 150,
        monsterAttack: 18,
    },
    {
        id: 3,
        name: '드래곤 화산',
        difficulty: '어려움',
        description: '전설의 드래곤이 잠들어있는 화산',
        reward: '전설의 목걸이 x1, 마법 간식 x2',
        rewards: [
            { itemId: 'legend_necklace', quantity: 1 },
            { itemId: 'magic_snack', quantity: 2 },
        ],
        monsterName: '화염 드래곤',
        monsterEmoji: '🐉',
        monsterHp: 300,
        monsterAttack: 30,
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

    useEffect(() => {
        const saved = localStorage.getItem('superpet-character');
        if (saved) {
            try {
                setCharacter(JSON.parse(saved));
            } catch { /* ignore */ }
        }
    }, []);

    const startBattle = (dungeon: DungeonData) => {
        if (!character) return;
        setSelectedDungeon(dungeon);
        setPlayerHp(character.hp);
        setMonsterHp(dungeon.monsterHp);
        setBattleState('fighting');
        setBattleLog([`${dungeon.monsterName}이(가) 나타났다!`]);
    };

    const handleAttack = useCallback(() => {
        if (battleState !== 'fighting' || !character || !selectedDungeon) return;

        const playerDmg = Math.floor(character.attack * (0.8 + Math.random() * 0.4));
        const newMonsterHp = Math.max(monsterHp - playerDmg, 0);
        setMonsterHp(newMonsterHp);

        const newLog = [`${character.name}의 공격! ${playerDmg} 데미지!`];

        if (newMonsterHp <= 0) {
            newLog.push(`${selectedDungeon.monsterName}을(를) 쓰러뜨렸다!`);
            // 보상 아이템 인벤토리에 저장
            for (const drop of selectedDungeon.rewards) {
                addItemToInventory(drop.itemId, drop.quantity);
                const item = GAME_ITEMS[drop.itemId];
                if (item) {
                    newLog.push(`${item.emoji} ${item.name} x${drop.quantity} 획득!`);
                }
            }
            setBattleLog((prev) => [...prev, ...newLog]);
            setBattleState('won');
            return;
        }

        const monsterDmg = Math.max(
            Math.floor(selectedDungeon.monsterAttack * (0.8 + Math.random() * 0.4) - character.defense * 0.3),
            1
        );
        const newPlayerHp = Math.max(playerHp - monsterDmg, 0);
        setPlayerHp(newPlayerHp);
        newLog.push(`${selectedDungeon.monsterName}의 반격! ${monsterDmg} 데미지!`);

        if (newPlayerHp <= 0) {
            newLog.push(`${character.name}이(가) 쓰러졌다...`);
            setBattleLog((prev) => [...prev, ...newLog]);
            setBattleState('lost');
            return;
        }

        setBattleLog((prev) => [...prev, ...newLog]);
    }, [battleState, character, selectedDungeon, monsterHp, playerHp]);

    const exitBattle = () => {
        setSelectedDungeon(null);
        setBattleState('idle');
        setBattleLog([]);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <div className="glass p-4 rounded-xl bg-white/5 mb-6 max-h-40 overflow-y-auto">
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
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {selectedDungeon.rewards.map((drop) => {
                                        const item = GAME_ITEMS[drop.itemId];
                                        if (!item) return null;
                                        return (
                                            <span key={drop.itemId} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground/5 text-sm font-medium">
                                                {item.emoji} {item.name} x{drop.quantity}
                                            </span>
                                        );
                                    })}
                                </div>
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
                    <span className="font-bold text-foreground">{character.name}</span> ({character.className}) 으로 도전!
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-4">
                            <Gift className="h-3.5 w-3.5" /> {dungeon.reward}
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
