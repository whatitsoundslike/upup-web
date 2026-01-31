'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Shield, Star, Trophy, ArrowLeft,
    Heart, Skull, Zap, PawPrint, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { type Character, type GameItem, GAME_ITEMS, addItemToInventory, addExpToCharacter, DUNGEON_EXP, ITEM_RARITY_TEXT, loadCharacter, saveCharacter, getTotalStats } from '../types';
import { useRouter } from 'next/navigation';

interface MonsterDrop {
    itemId: string;
    chance: number; // 0~100%
}

interface DroppedItem {
    item: GameItem;
    quantity: number;
}

interface MonsterData {
    name: string;
    emoji: string;
    level: number;
    hp: number;
    attack: number;
    isBoss: boolean;
    spawnChance: number; // 등장 확률 (0~100)
    drops: MonsterDrop[];
}

interface DungeonData {
    id: number;
    name: string;
    levelRange: string; // "1~10" 형식
    minLevel: number;
    maxLevel: number;
    description: string;
    monsters: MonsterData[];
}

const dungeons: DungeonData[] = [
    {
        id: 1,
        name: '한강',
        levelRange: 'LV 1~10',
        minLevel: 1,
        maxLevel: 10,
        description: '도심 속 평화로운 강변. 초보 모험가들이 처음 발걸음을 내딛는 곳',
        monsters: [
            {
                name: '떠돌이 비둘기',
                emoji: '🕊️',
                level: 3,
                hp: 60,
                attack: 10,
                isBoss: false,
                spawnChance: 55,
                drops: [
                    { itemId: 'potion', chance: 50 },
                    { itemId: 'iron_helmet', chance: 5 },
                ],
            },
            {
                name: '길고양이',
                emoji: '🐱',
                level: 5,
                hp: 80,
                attack: 12,
                isBoss: false,
                spawnChance: 40,
                drops: [
                    { itemId: 'potion', chance: 60 },
                    { itemId: 'enhanced_feed', chance: 10 },
                    { itemId: 'cloth_gloves', chance: 8 },
                ],
            },
            {
                name: '한강 괴물',
                emoji: '🦖',
                level: 10,
                hp: 150,
                attack: 17,
                isBoss: true,
                spawnChance: 5,
                drops: [
                    { itemId: 'enhanced_feed', chance: 40 },
                    { itemId: 'leather_armor', chance: 20 },
                    { itemId: 'running_shoes', chance: 15 },
                ],
            },
        ],
    },
    {
        id: 2,
        name: '관악산',
        levelRange: 'LV 11~20',
        minLevel: 11,
        maxLevel: 20,
        description: '서울의 진산. 울창한 숲과 험준한 바위가 모험가를 시험한다',
        monsters: [
            {
                name: '산토끼',
                emoji: '🐰',
                level: 13,
                hp: 120,
                attack: 21,
                isBoss: false,
                spawnChance: 55,
                drops: [
                    { itemId: 'potion', chance: 65 },
                    { itemId: 'enhanced_feed', chance: 20 },
                    { itemId: 'running_shoes', chance: 10 },
                    { itemId: 'wooden_sword', chance: 10 },
                ],
            },
            {
                name: '멧돼지',
                emoji: '🐗',
                level: 17,
                hp: 180,
                attack: 27,
                isBoss: false,
                spawnChance: 40,
                drops: [
                    { itemId: 'enhanced_feed', chance: 30 },
                    { itemId: 'magic_snack', chance: 8 },
                    { itemId: 'knight_helmet', chance: 12 },
                ],
            },
            {
                name: '산신령',
                emoji: '👹',
                level: 20,
                hp: 280,
                attack: 36,
                isBoss: true,
                spawnChance: 5,
                drops: [
                    { itemId: 'magic_snack', chance: 25 },
                    { itemId: 'wind_boots', chance: 18 },
                    { itemId: 'simple_cloak', chance: 20 },
                    { itemId: 'wooden_sword', chance: 15 },
                ],
            },
        ],
    },
    {
        id: 3,
        name: '지리산',
        levelRange: 'LV 21~30',
        minLevel: 21,
        maxLevel: 30,
        description: '영남의 명산. 깊은 계곡과 높은 봉우리에 강력한 존재들이 깃들어 있다',
        monsters: [
            {
                name: '산악 독수리',
                emoji: '🦅',
                level: 23,
                hp: 220,
                attack: 39,
                isBoss: false,
                spawnChance: 55,
                drops: [
                    { itemId: 'enhanced_feed', chance: 40 },
                    { itemId: 'magic_snack', chance: 15 },
                    { itemId: 'power_gloves', chance: 8 },
                ],
            },
            {
                name: '반달가슴곰',
                emoji: '🐻',
                level: 27,
                hp: 320,
                attack: 48,
                isBoss: false,
                spawnChance: 40,
                drops: [
                    { itemId: 'magic_snack', chance: 20 },
                    { itemId: 'starlight_armor', chance: 10 },
                    { itemId: 'holy_shield', chance: 8 },
                ],
            },
            {
                name: '천왕봉 수호자',
                emoji: '🦄',
                level: 30,
                hp: 450,
                attack: 57,
                isBoss: true,
                spawnChance: 5,
                drops: [
                    { itemId: 'magic_snack', chance: 35 },
                    { itemId: 'shadow_cloak', chance: 15 },
                    { itemId: 'flame_sword', chance: 5 },
                    { itemId: 'legend_necklace', chance: 3 },
                ],
            },
        ],
    },
    {
        id: 4,
        name: '한라산',
        levelRange: 'LV 31~40',
        minLevel: 31,
        maxLevel: 40,
        description: '제주의 영봉. 신비로운 기운이 감도는 이곳엔 전설의 존재들이 살고 있다',
        monsters: [
            {
                name: '백록',
                emoji: '🦌',
                level: 33,
                hp: 380,
                attack: 63,
                isBoss: false,
                spawnChance: 55,
                drops: [
                    { itemId: 'magic_snack', chance: 30 },
                    { itemId: 'legend_food', chance: 5 },
                    { itemId: 'wind_boots', chance: 20 },
                ],
            },
            {
                name: '화산 정령',
                emoji: '🔥',
                level: 37,
                hp: 480,
                attack: 72,
                isBoss: false,
                spawnChance: 40,
                drops: [
                    { itemId: 'legend_food', chance: 8 },
                    { itemId: 'dragon_armor', chance: 6 },
                    { itemId: 'flame_sword', chance: 10 },
                ],
            },
            {
                name: '백두산 신룡',
                emoji: '🐉',
                level: 40,
                hp: 650,
                attack: 83,
                isBoss: true,
                spawnChance: 5,
                drops: [
                    { itemId: 'legend_food', chance: 15 },
                    { itemId: 'dragon_armor', chance: 12 },
                    { itemId: 'flame_sword', chance: 15 },
                    { itemId: 'legend_necklace', chance: 8 },
                ],
            },
        ],
    },
];

type BattleState = 'idle' | 'fighting' | 'won' | 'lost';

export default function Dungeon() {
    const [character, setCharacter] = useState<Character | null>(null);
    const [selectedDungeon, setSelectedDungeon] = useState<DungeonData | null>(null);
    const [selectedMonster, setSelectedMonster] = useState<MonsterData | null>(null);
    const [battleState, setBattleState] = useState<BattleState>('idle');
    const [playerHp, setPlayerHp] = useState(0);
    const [monsterHp, setMonsterHp] = useState(0);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
    const [lowHpWarning, setLowHpWarning] = useState(false);
    const [autoBattle, setAutoBattle] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setCharacter(loadCharacter());
        const saved = localStorage.getItem('superpet_autoBattle');
        if (saved !== null) setAutoBattle(saved === 'true');
    }, []);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [battleLog]);

    useEffect(() => {
        if (battleState === 'won' || battleState === 'lost') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }, [battleState]);

    const toggleAutoBattle = (checked: boolean) => {
        setAutoBattle(checked);
        localStorage.setItem('superpet_autoBattle', String(checked));
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

        // 혹시 모를 경우를 대비해 첫 번째 몬스터 반환
        return dungeon.monsters[0];
    };

    const startBattle = (dungeon: DungeonData) => {
        if (!character) return;

        // 체력이 0 이하인 경우 경고 모달 표시
        if (character.currentHp <= 0) {
            setLowHpWarning(true);
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 랜덤 몬스터 선택
        const monster = selectRandomMonster(dungeon);

        setSelectedDungeon(dungeon);
        setSelectedMonster(monster);

        // 장비 보너스를 포함한 최대 HP 계산
        const totalStats = getTotalStats(character);
        const maxHp = totalStats.hp;

        // 현재 HP가 최대 HP를 초과하지 않도록 제한
        const hp = Math.min(
            character.currentHp > 0 && !isNaN(character.currentHp) ? character.currentHp : maxHp,
            maxHp
        );

        setPlayerHp(hp);
        setMonsterHp(monster.hp);
        setBattleState('fighting');
        setBattleLog([
            `${monster.name}${monster.isBoss ? ' (보스)' : ''}이(가) 나타났다!`,
            `LV.${monster.level} | HP ${monster.hp} | 공격력 ${monster.attack}`
        ]);
        setDroppedItems([]);
    };

    const handleAttack = useCallback(() => {
        if (battleState !== 'fighting' || !character || !selectedDungeon || !selectedMonster) return;

        // 장비 보너스를 포함한 총 스탯 계산
        const totalStats = getTotalStats(character);

        // speed 기반 확률: 더블 어택 (최대 50%), 회피 (최대 40%)
        const doubleAttackChance = Math.min(totalStats.speed / 500, 0.5);
        const dodgeChance = Math.min(totalStats.speed / 500, 0.4);

        const newLog: string[] = [];

        // 1차 공격
        const playerDmg = Math.floor(totalStats.attack * (0.8 + Math.random() * 0.4));
        let currentMonsterHp = Math.max(monsterHp - playerDmg, 0);
        newLog.push(`${character.name}의 공격! ${playerDmg} 데미지!`);

        // 더블 어택 판정
        if (currentMonsterHp > 0 && Math.random() < doubleAttackChance) {
            const bonusDmg = Math.floor(totalStats.attack * (0.6 + Math.random() * 0.3));
            currentMonsterHp = Math.max(currentMonsterHp - bonusDmg, 0);
            newLog.push(`⚡ 빠른 연속 공격! ${bonusDmg} 추가 데미지!`);
        }

        setMonsterHp(currentMonsterHp);

        if (currentMonsterHp <= 0) {
            newLog.push(`${selectedMonster.name}을(를) 쓰러뜨렸다!`);
            // 각 아이템별 독립 확률 판정
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
                    newLog.push(`${drop.item.emoji} ${drop.item.name} 획득!`);
                }
            } else {
                newLog.push('드롭된 아이템이 없다...');
            }
            setDroppedItems(drops);
            // 몬스터 레벨 기반 경험치 (레벨 * 10 + 보스 보너스)
            const earnedExp = selectedMonster.level * 10 + (selectedMonster.isBoss ? 50 : 0);
            const baseGold = selectedMonster.level * 5 + (selectedMonster.isBoss ? 50 : 0);
            const earnedGold = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
            const { character: updated, leveledUp, levelsGained } = addExpToCharacter(earnedExp);

            updated.currentHp = playerHp;
            updated.gold += earnedGold;
            saveCharacter(updated);
            setCharacter(updated);
            newLog.push(`💰 ${earnedGold}G 획득!`);
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
                Math.floor(selectedMonster.attack * (0.8 + Math.random() * 0.4) - totalStats.defense),
                5
            );
            const newPlayerHp = Math.max(playerHp - monsterDmg, 0);
            setPlayerHp(newPlayerHp);
            newLog.push(`${selectedMonster.name}의 반격! ${monsterDmg} 데미지!`);

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

    // 자동 전투 인터벌
    useEffect(() => {
        if (!autoBattle || battleState !== 'fighting') return;
        const interval = setInterval(() => {
            handleAttack();
        }, 500);
        return () => clearInterval(interval);
    }, [autoBattle, battleState, handleAttack]);

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
    if (selectedDungeon && selectedMonster) {
        // 장비 보너스를 포함한 최대 HP 계산
        const totalStats = getTotalStats(character);
        const playerHpPct = Math.max((playerHp / totalStats.hp) * 100, 0);
        const monsterHpPct = Math.max((monsterHp / selectedMonster.hp) * 100, 0);

        return (
            <div className="max-w-3xl mx-auto px-4 py-2">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black mb-2 text-center"
                >
                    {selectedDungeon.name}
                </motion.h2>

                {/* 배틀 필드 */}
                <div className="relative grid grid-cols-2 gap-6">
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
                            <span className="font-bold">{playerHp} / {totalStats.hp}</span>
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
                            <div className="text-4xl mb-2">{selectedMonster?.emoji}</div>
                            <h3 className="font-bold text-lg">{selectedMonster?.name}</h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${selectedMonster?.isBoss ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                LV.{selectedMonster?.level} {selectedMonster?.isBoss ? '보스' : ''}
                            </span>
                        </div>
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5 text-red-500" /> HP
                            </span>
                            <span className="font-bold">{monsterHp} / {selectedMonster?.hp}</span>
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
                    <div className="space-y-3">
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAttack}
                                disabled={autoBattle}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${autoBattle ? 'bg-red-500/50 text-white/50 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                                <Swords className="h-5 w-5" /> {autoBattle ? '자동 전투 중...' : '공격!'}
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
                        <label className="flex items-center justify-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={autoBattle}
                                onChange={(e) => toggleAutoBattle(e.target.checked)}
                                className="w-4 h-4 rounded accent-red-500"
                            />
                            <span className="text-sm text-foreground/60 font-semibold">자동 전투</span>
                        </label>
                    </div>
                )}

                {/* 결과 오버레이 */}
                <AnimatePresence>
                    {battleState === 'won' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass px-8 rounded-2xl bg-white/5 text-center"
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
                                    onClick={() => startBattle(selectedDungeon)}
                                    className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                    <Swords className="h-4 w-4" /> 다시 도전
                                </button>
                                <button
                                    onClick={exitBattle}
                                    className="px-3 py-1.5 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    다른 던전 선택
                                </button>
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
                                    onClick={() => { router.push("/superpet/room") }}
                                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    집으로...
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
        <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="text-center mb-4">
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
                    <span className="text-foreground/40">/ {getTotalStats(character).hp}</span>
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
                        className="p-6 rounded-2xl bg-white/5 shadow-lg flex flex-col border-1 border-foreground/20"
                    >
                        <div className="text-center mb-4">
                            <div className="flex justify-center gap-1 text-3xl mb-3">
                                {dungeon.monsters.map((m, i) => (
                                    <span key={i}>{m.emoji}</span>
                                ))}
                            </div>
                            <h3 className="text-lg font-bold mb-1">{dungeon.name}</h3>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                {dungeon.levelRange}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/60 leading-relaxed mb-4 flex-1">
                            {dungeon.description}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-foreground/50 mb-4">
                            <Gift className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            {Array.from(new Set(dungeon.monsters.flatMap(m => m.drops.map(d => d.itemId)))).map((itemId) => {
                                const item = GAME_ITEMS[itemId];
                                return item ? <span key={itemId}>{item.emoji}</span> : null;
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
                                <h3 className="text-xl font-black mb-2">체력이 부족합니다!</h3>
                                <p className="text-sm text-foreground/60">
                                    던전에 도전하려면 체력이 필요합니다.<br />
                                    인벤토리에서 회복 아이템을 사용하세요.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setLowHpWarning(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    닫기
                                </button>
                                <Link
                                    href="/superpet/room"
                                    className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Heart className="h-4 w-4" /> 인벤토리
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
