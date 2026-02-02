'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Shield, Star, Trophy, ArrowLeft,
    Heart, Skull, Zap, PawPrint, Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { type Character, type GameItem, GAME_ITEMS, addItemToInventory, addExpToCharacter, DUNGEON_EXP, ITEM_RARITY_TEXT, loadCharacter, saveCharacter, getTotalStats, useFood, loadInventory, type InventoryItem } from '../types';
import { getItem, setItem } from '../storage';
import { useLanguage } from '../i18n/LanguageContext';
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
        id: 5,
        name: '은빛 소나무 숲',
        levelRange: 'LV 1~10',
        minLevel: 1,
        maxLevel: 10,
        description: '은빛으로 빛나는 소나무가 가득한 신비로운 숲. 다양한 숲속 생물들이 서식한다',
        monsters: [
            {
                name: '솔잎 다람쥐',
                emoji: '🐿️',
                level: 2,
                hp: 60,
                attack: 10,
                isBoss: false,
                spawnChance: 25,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'iron_helmet', chance: 10 },
                    { itemId: 'simple_cloak', chance: 10 },
                ],
            },
            {
                name: '숲속 여우',
                emoji: '🦊',
                level: 4,
                hp: 65,
                attack: 11,
                isBoss: false,
                spawnChance: 22,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'iron_helmet', chance: 10 },
                    { itemId: 'leather_armor', chance: 10 },
                ],
            },
            {
                name: '은빛 올빼미',
                emoji: '🦉',
                level: 5,
                hp: 70,
                attack: 12,
                isBoss: false,
                spawnChance: 20,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'cloth_gloves', chance: 10 },
                    { itemId: 'simple_cloak', chance: 10 },
                ],
            },
            {
                name: '독버섯 정령',
                emoji: '🍄',
                level: 7,
                hp: 75,
                attack: 13,
                isBoss: false,
                spawnChance: 17,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'running_shoes', chance: 10 },
                    { itemId: 'wooden_shield', chance: 10 },
                ],
            },
            {
                name: '은빛 늑대',
                emoji: '🐺',
                level: 9,
                hp: 80,
                attack: 15,
                isBoss: false,
                spawnChance: 13,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'wooden_sword', chance: 10 },
                    { itemId: 'iron_helmet', chance: 10 },
                ],
            },
            {
                name: '소나무 수호령',
                emoji: '🌲',
                level: 10,
                hp: 150,
                attack: 17,
                isBoss: true,
                spawnChance: 3,
                drops: [
                    { itemId: 'dubai_cookie', chance: 100 },
                    { itemId: 'iron_helmet', chance: 20 },
                    { itemId: 'leather_armor', chance: 20 },
                    { itemId: 'cloth_gloves', chance: 20 },
                    { itemId: 'running_shoes', chance: 20 },
                    { itemId: 'simple_cloak', chance: 20 },
                    { itemId: 'wooden_sword', chance: 20 },
                    { itemId: 'wooden_shield', chance: 20 },
                    { itemId: 'wooden_pendant', chance: 20 },
                    { itemId: 'copper_ring', chance: 20 },
                ],
            },
        ],
    },
    {
        id: 6,
        name: '정령의 숲길',
        levelRange: 'LV 11~20',
        minLevel: 11,
        maxLevel: 20,
        description: '고대 정령들이 숨쉬는 깊은 숲길. 자연의 힘이 강하게 느껴진다',
        monsters: [
            {
                name: '이끼 요정',
                emoji: '🧚',
                level: 12,
                hp: 80,
                attack: 40,
                isBoss: false,
                spawnChance: 25,
                drops: [
                    { itemId: 'feed', chance: 60 },
                    { itemId: 'dubai_cookie', chance: 30 },
                    { itemId: 'silver_necklace', chance: 5 },
                    { itemId: 'silver_ring', chance: 5 },
                ],
            },
            {
                name: '숲 정령',
                emoji: '🌿',
                level: 14,
                hp: 90,
                attack: 42,
                isBoss: false,
                spawnChance: 22,
                drops: [
                    { itemId: 'feed', chance: 60 },
                    { itemId: 'dubai_cookie', chance: 30 },
                    { itemId: 'bronze_helmet', chance: 5 },
                    { itemId: 'chain_armor', chance: 5 },
                ],
            },
            {
                name: '나무 골렘',
                emoji: '🪵',
                level: 16,
                hp: 100,
                attack: 44,
                isBoss: false,
                spawnChance: 20,
                drops: [
                    { itemId: 'feed', chance: 60 },
                    { itemId: 'dubai_cookie', chance: 30 },
                    { itemId: 'leather_gloves', chance: 5 },
                    { itemId: 'traveler_cloak', chance: 5 },
                ],
            },
            {
                name: '덩굴 뱀',
                emoji: '🐍',
                level: 18,
                hp: 110,
                attack: 47,
                isBoss: false,
                spawnChance: 17,
                drops: [
                    { itemId: 'feed', chance: 60 },
                    { itemId: 'dubai_cookie', chance: 30 },
                    { itemId: 'leather_boots', chance: 5 },
                    { itemId: 'iron_shield', chance: 5 },
                ],
            },
            {
                name: '어둠 정령',
                emoji: '👻',
                level: 19,
                hp: 120,
                attack: 48,
                isBoss: false,
                spawnChance: 13,
                drops: [
                    { itemId: 'feed', chance: 60 },
                    { itemId: 'dubai_cookie', chance: 30 },
                    { itemId: 'iron_sword', chance: 5 },
                    { itemId: 'bronze_helmet', chance: 5 },
                ],
            },
            {
                name: '숲의 대정령',
                emoji: '🐉',
                level: 20,
                hp: 300,
                attack: 50,
                isBoss: true,
                spawnChance: 3,
                drops: [
                    { itemId: 'dubai_cookie', chance: 100 },
                    { itemId: 'bronze_helmet', chance: 20 },
                    { itemId: 'chain_armor', chance: 20 },
                    { itemId: 'leather_gloves', chance: 20 },
                    { itemId: 'leather_boots', chance: 20 },
                    { itemId: 'traveler_cloak', chance: 20 },
                    { itemId: 'iron_sword', chance: 20 },
                    { itemId: 'iron_shield', chance: 20 },
                    { itemId: 'silver_necklace', chance: 20 },
                    { itemId: 'silver_ring', chance: 20 },
                ],
            },
        ],
    },
    {
        id: 7,
        name: '대지의 균열',
        levelRange: 'LV 21~30',
        minLevel: 21,
        maxLevel: 30,
        description: '대지가 갈라지며 드러난 지하 세계. 용암과 바위 사이로 강력한 존재들이 도사린다',
        monsters: [
            {
                name: '용암 전갈',
                emoji: '🦂',
                level: 22,
                hp: 250,
                attack: 50,
                isBoss: false,
                spawnChance: 25,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'ruby_necklace', chance: 5 },
                    { itemId: 'sapphire_ring', chance: 5 },
                ],
            },
            {
                name: '바위 골렘',
                emoji: '🗿',
                level: 24,
                hp: 265,
                attack: 52,
                isBoss: false,
                spawnChance: 22,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'knight_helmet', chance: 5 },
                    { itemId: 'plate_armor', chance: 5 },
                ],
            },
            {
                name: '지하 거미',
                emoji: '🕷️',
                level: 26,
                hp: 280,
                attack: 54,
                isBoss: false,
                spawnChance: 20,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'steel_gauntlets', chance: 5 },
                    { itemId: 'mage_cloak', chance: 5 },
                ],
            },
            {
                name: '균열 도마뱀',
                emoji: '🦎',
                level: 28,
                hp: 290,
                attack: 57,
                isBoss: false,
                spawnChance: 17,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'wind_boots', chance: 5 },
                    { itemId: 'guardian_shield', chance: 5 },
                ],
            },
            {
                name: '마그마 뱀',
                emoji: '🐉',
                level: 29,
                hp: 300,
                attack: 60,
                isBoss: false,
                spawnChance: 13,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'katana', chance: 5 },
                    { itemId: 'knight_helmet', chance: 5 },
                ],
            },
            {
                name: '대지의 군주',
                emoji: '🌋',
                level: 30,
                hp: 500,
                attack: 80,
                isBoss: true,
                spawnChance: 3,
                drops: [
                    { itemId: 'dubai_cookie', chance: 100 },
                    { itemId: 'knight_helmet', chance: 10 },
                    { itemId: 'plate_armor', chance: 10 },
                    { itemId: 'steel_gauntlets', chance: 10 },
                    { itemId: 'wind_boots', chance: 10 },
                    { itemId: 'mage_cloak', chance: 10 },
                    { itemId: 'katana', chance: 10 },
                    { itemId: 'guardian_shield', chance: 10 },
                    { itemId: 'ruby_necklace', chance: 10 },
                    { itemId: 'sapphire_ring', chance: 10 },
                ],
            },
        ],
    },
    {
        id: 8,
        name: '피닉스의 둥지',
        levelRange: 'LV 31~40',
        minLevel: 31,
        maxLevel: 40,
        description: '하늘 높이 솟은 화산 꼭대기의 둥지. 불사조의 화염이 모든 것을 태운다',
        monsters: [
            {
                name: '화염 박쥐',
                emoji: '🦇',
                level: 32,
                hp: 450,
                attack: 80,
                isBoss: false,
                spawnChance: 25,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'diamond_necklace', chance: 3 },
                    { itemId: 'emerald_ring', chance: 3 },
                ],
            },
            {
                name: '용암 거북',
                emoji: '🐢',
                level: 34,
                hp: 500,
                attack: 85,
                isBoss: false,
                spawnChance: 22,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'phoenix_helmet', chance: 3 },
                    { itemId: 'starlight_armor', chance: 3 },
                ],
            },
            {
                name: '불꽃 하피',
                emoji: '🦅',
                level: 36,
                hp: 530,
                attack: 90,
                isBoss: false,
                spawnChance: 20,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'ogre_power_gauntlet', chance: 3 },
                    { itemId: 'shadow_cloak', chance: 3 },
                ],
            },
            {
                name: '화산 기사',
                emoji: '⚔️',
                level: 38,
                hp: 570,
                attack: 95,
                isBoss: false,
                spawnChance: 17,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'thunder_boots', chance: 3 },
                    { itemId: 'holy_shield', chance: 3 },
                ],
            },
            {
                name: '불의 정령',
                emoji: '🔥',
                level: 39,
                hp: 600,
                attack: 100,
                isBoss: false,
                spawnChance: 13,
                drops: [
                    { itemId: 'feed', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'shadow_blade', chance: 3 },
                    { itemId: 'phoenix_helmet', chance: 3 },
                ],
            },
            {
                name: '피닉스',
                emoji: '🐦‍🔥',
                level: 40,
                hp: 900,
                attack: 120,
                isBoss: true,
                spawnChance: 3,
                drops: [
                    { itemId: 'dubai_cookie', chance: 100 },
                    { itemId: 'phoenix_helmet', chance: 10 },
                    { itemId: 'starlight_armor', chance: 10 },
                    { itemId: 'ogre_power_gauntlet', chance: 10 },
                    { itemId: 'thunder_boots', chance: 10 },
                    { itemId: 'shadow_cloak', chance: 10 },
                    { itemId: 'shadow_blade', chance: 10 },
                    { itemId: 'holy_shield', chance: 10 },
                    { itemId: 'phoenix_heart', chance: 10 },
                    { itemId: 'emerald_ring', chance: 10 },
                ],
            },
        ],
    },
    {
        id: 9,
        name: '용의 계곡',
        description: '고대의 용들이 서식하는 위험한 계곡. 강력한 드래곤들이 도사리고 있다',
        levelRange: 'LV 41~50',
        minLevel: 41,
        maxLevel: 50,
        monsters: [
            {
                name: '어린 비룡',
                emoji: '🦎',
                level: 42,
                hp: 500,
                attack: 110,
                isBoss: false,
                spawnChance: 26,
                drops: [
                    { itemId: 'meat', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'phoenix_helmet', chance: 5 },
                    { itemId: 'starlight_armor', chance: 5 },
                ],
            },
            {
                name: '독룡',
                emoji: '🐍',
                level: 44,
                hp: 550,
                attack: 115,
                isBoss: false,
                spawnChance: 23,
                drops: [
                    { itemId: 'meat', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'ogre_power_gauntlet', chance: 5 },
                    { itemId: 'thunder_boots', chance: 5 },
                ],
            },
            {
                name: '화염 드레이크',
                emoji: '🔥',
                level: 46,
                hp: 600,
                attack: 120,
                isBoss: false,
                spawnChance: 21,
                drops: [
                    { itemId: 'meat', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'shadow_cloak', chance: 5 },
                    { itemId: 'shadow_blade', chance: 5 },
                ],
            },
            {
                name: '빙결 와이번',
                emoji: '❄️',
                level: 48,
                hp: 650,
                attack: 125,
                isBoss: false,
                spawnChance: 17,
                drops: [
                    { itemId: 'meat', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'holy_shield', chance: 5 },
                    { itemId: 'diamond_necklace', chance: 5 },
                ],
            },
            {
                name: '암흑 비룡',
                emoji: '🖤',
                level: 49,
                hp: 700,
                attack: 120,
                isBoss: false,
                spawnChance: 12,
                drops: [
                    { itemId: 'meat', chance: 40 },
                    { itemId: 'dubai_cookie', chance: 20 },
                    { itemId: 'emerald_ring', chance: 5 },
                    { itemId: 'phoenix_helmet', chance: 5 },
                ],
            },
            {
                name: '마룡',
                emoji: '🐲',
                level: 50,
                hp: 1500,
                attack: 150,
                isBoss: true,
                spawnChance: 1,
                drops: [
                    { itemId: 'legend_meat', chance: 100 },
                    { itemId: 'dragon_helmet', chance: 10 },
                    { itemId: 'dragon_armor', chance: 10 },
                    { itemId: 'titan_fists', chance: 10 },
                    { itemId: 'pegasus_boots', chance: 10 },
                    { itemId: 'celestial_cloak', chance: 10 },
                    { itemId: 'excalibur', chance: 10 },
                    { itemId: 'aegis_shield', chance: 10 },
                    { itemId: 'diamond_necklace', chance: 10 },
                    { itemId: 'infinity_ring', chance: 10 },
                ],
            },
        ],
    },
];

type BattleState = 'idle' | 'fighting' | 'won' | 'lost';

const ELEMENT_EMOJI: Record<string, string> = { '불': '🔥', '물': '💧', '풍': '🍃', '땅': '🪨' };

export default function Dungeon() {
    const { t, lang } = useLanguage();
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
    const [activeToast, setActiveToast] = useState<{ message: string; tone: 'success' | 'error'; key: number } | null>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const battleFieldRef = useRef<HTMLDivElement>(null);
    const [isAttacking, setIsAttacking] = useState(false);
    const [showImpact, setShowImpact] = useState(false);
    const [impactKey, setImpactKey] = useState(0);
    const [attackDistance, setAttackDistance] = useState(100);
    const router = useRouter();

    useEffect(() => {
        setCharacter(loadCharacter());
        setInventory(loadInventory());
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

    useEffect(() => {
        if (battleState === 'won' || battleState === 'lost') {
            const isMobile = window.innerWidth < 768;
            // if (isMobile) {
            //     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            // }
        }
    }, [battleState]);

    // 배틀 필드 너비에 비례하여 돌진 거리 계산
    useEffect(() => {
        const update = () => {
            if (battleFieldRef.current) {
                const w = battleFieldRef.current.offsetWidth;
                // 각 칸의 약 55%만큼 이동 (gap-6=24px 고려)
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
            // 인벤토리 상태 갱신
            setInventory(loadInventory());

            const msg = lang === 'ko'
                ? `${result.itemName}을(를) 사용하여 HP ${result.hpRecovered} 회복했습니다!`
                : `Used ${t(result.itemName!)} to recover ${result.hpRecovered} HP!`;
            showToast(msg, 'success');
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
            `${t(monster.name)}${monster.isBoss ? ` (${t('보스')})` : ''}${t('이(가) 나타났다!')}`,
            `LV.${monster.level} | HP ${monster.hp} | ${t('공격력')} ${monster.attack}`
        ]);
        setDroppedItems([]);
    };

    const handleAttack = useCallback(() => {
        if (battleState !== 'fighting' || !character || !selectedDungeon || !selectedMonster) return;

        // 공격 애니메이션 트리거: 양쪽이 중앙으로 돌진 → 충돌 → 복귀
        setIsAttacking(true);
        setTimeout(() => {
            setImpactKey(k => k + 1);
            setShowImpact(true);
            setTimeout(() => setShowImpact(false), 500);
        }, 250);
        setTimeout(() => setIsAttacking(false), 550);

        // 장비 보너스를 포함한 총 스탯 계산
        const totalStats = getTotalStats(character);

        // speed 기반 확률: 더블 어택 (최대 50%), 회피 (최대 40%)
        const doubleAttackChance = Math.min(totalStats.speed / 500, 0.5);
        const dodgeChance = Math.min(totalStats.speed / 500, 0.4);

        const newLog: ReactNode[] = [];

        // 1차 공격
        const playerDmg = Math.floor(totalStats.attack * (0.8 + Math.random() * 0.4));
        let currentMonsterHp = Math.max(monsterHp - playerDmg, 0);
        newLog.push(`${character.name}${t('의 공격!')} ${playerDmg} ${t('데미지!')}`);

        // 더블 어택 판정
        if (currentMonsterHp > 0 && Math.random() < doubleAttackChance) {
            const bonusDmg = Math.floor(totalStats.attack * (0.6 + Math.random() * 0.3));
            currentMonsterHp = Math.max(currentMonsterHp - bonusDmg, 0);
            newLog.push(`⚡ ${t('빠른 연속 공격!')} ${bonusDmg} ${t('추가 데미지!')}`);
        }

        setMonsterHp(currentMonsterHp);

        if (currentMonsterHp <= 0) {
            newLog.push(`${t(selectedMonster.name)}${t('을(를) 쓰러뜨렸다!')}`);
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
                    newLog.push(
                        <span key={`drop-${drop.item.id}-${Date.now()}`}>
                            {drop.item.emoji} <span className={ITEM_RARITY_TEXT[drop.item.rarity]}>{t(drop.item.name)}</span> {t('획득!')}
                        </span>
                    );
                }
            } else {
                newLog.push(t('드롭된 아이템이 없다...'));
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
            setInventory(loadInventory());
            newLog.push(`💰 ${earnedGold}G ${lang === 'ko' ? '획득!' : 'earned!'}`);
            newLog.push(`EXP +${earnedExp} ${lang === 'ko' ? '획득!' : 'earned!'}`);
            if (leveledUp) {
                newLog.push(`${t('레벨 업!')} Lv.${updated.level - levelsGained} → Lv.${updated.level}`);
            }
            setBattleLog((prev) => [...prev, ...newLog]);
            setBattleState('won');
            return;
        }

        // 회피 판정
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

    // 최종 렌더링
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
                <div className="max-w-3xl mx-auto px-4 py-2">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-black mb-2 text-center"
                    >
                        {t(selectedDungeon.name)}
                    </motion.h2>

                    {/* 배틀 필드 */}
                    <motion.div
                        ref={battleFieldRef}
                        animate={showImpact ? { x: [0, -4, 4, -3, 3, 0], y: [0, 2, -2, 1, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        className="relative grid grid-cols-2 gap-6"
                    >
                        {/* VS 표시 + 충돌 이펙트 */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-5">
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                                className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                            >
                                <span className="text-white font-black text-sm">VS</span>
                            </motion.div>
                            {impactKey > 0 && (
                                <div key={impactKey}>
                                    {/* 화면 플래시 */}
                                    <motion.div
                                        className="fixed inset-0 bg-white/30 pointer-events-none z-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    {/* 중앙 폭발 */}
                                    <motion.div
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400"
                                        initial={{ width: 0, height: 0, opacity: 1 }}
                                        animate={{ width: 100, height: 100, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                    />
                                    {/* 충격파 링 1 */}
                                    <motion.div
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/80"
                                        initial={{ width: 0, height: 0, opacity: 1 }}
                                        animate={{ width: 120, height: 120, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                    {/* 충격파 링 2 */}
                                    <motion.div
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50"
                                        initial={{ width: 0, height: 0, opacity: 1 }}
                                        animate={{ width: 150, height: 150, opacity: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
                                    />
                                    {/* 방사형 충격파 라인 */}
                                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                                        <motion.div
                                            key={`line-${deg}`}
                                            className="absolute left-1/2 top-1/2 h-[2px] bg-gradient-to-r from-amber-400 to-transparent origin-left"
                                            style={{ rotate: `${deg}deg` }}
                                            initial={{ width: 0, opacity: 1 }}
                                            animate={{ width: 60, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    ))}
                                    {/* 스파크 파티클 */}
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                                        <motion.div
                                            key={`spark-${deg}`}
                                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-amber-300"
                                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                            animate={{
                                                x: Math.cos((deg * Math.PI) / 180) * 55,
                                                y: Math.sin((deg * Math.PI) / 180) * 55,
                                                opacity: 0,
                                                scale: 0,
                                            }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* 플레이어 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-2 rounded-2xl bg-white/5 z-10"
                        >
                            <div className="text-center mb-4">
                                <motion.div
                                    animate={isAttacking
                                        ? { x: attackDistance, scale: 0.9, rotate: 12 }
                                        : { x: 0, scale: 1, rotate: 0 }
                                    }
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                >
                                    {character.image ? (
                                        <img src={character.image} alt={character.name} className="w-27 h-40 object-cover rounded-xl mx-auto mb-2 border border-amber-500" />
                                    ) : (
                                        <div className="text-4xl mb-2">🐾</div>
                                    )}
                                </motion.div>
                                <h3 className="font-bold text-lg">{character.name}</h3>
                                <p className="text-xs text-foreground/50">{ELEMENT_EMOJI[character.element]} {t(character.className)}</p>
                            </div>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="flex items-center gap-1">
                                    <Heart className="h-3.5 w-3.5 text-red-500" /> HP
                                </span>
                                <span className="font-bold">{playerHp} / {getTotalStats(character).hp}</span>
                            </div>
                            <div className="h-4 rounded-full bg-foreground/10 overflow-hidden">
                                <motion.div
                                    animate={{ width: `${Math.max((playerHp / getTotalStats(character).hp) * 100, 0)}%` }}
                                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                                />
                            </div>
                        </motion.div>

                        {/* 몬스터 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-2 rounded-2xl bg-white/5 z-10"
                        >
                            <div className="text-center mb-4 flex flex-col items-center">
                                <motion.div
                                    animate={isAttacking
                                        ? { x: -attackDistance, scale: 0.9, rotate: -12 }
                                        : { x: 0, scale: 1, rotate: 0 }
                                    }
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className="text-4xl mb-2 w-25 h-40 flex items-center justify-center"
                                >
                                    {selectedMonster?.emoji}
                                </motion.div>
                                <h3 className="font-bold text-lg">{t(selectedMonster?.name)}</h3>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold ${selectedMonster?.isBoss ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                    LV.{selectedMonster?.level} {selectedMonster?.isBoss ? t('보스') : ''}
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
                                    animate={{ width: `${Math.max((monsterHp / selectedMonster.hp) * 100, 0)}%` }}
                                    className="h-full rounded-full bg-red-500 transition-all duration-300"
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* 배틀 로그 */}
                    <div ref={logRef} className="glass p-4 rounded-xl bg-white/5 mb-6 h-30 overflow-y-auto">
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
                            <div className="w-full py-4 rounded-xl bg-foreground/10 text-foreground/60 font-bold text-lg flex items-center justify-center gap-2">
                                <Swords className="h-5 w-5 animate-pulse text-red-500" /> {t('자동 전투 진행 중...')}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={exitBattle}
                                className="w-full py-3 rounded-xl bg-foreground/5 text-foreground/40 text-sm font-bold hover:bg-foreground/10 transition-colors"
                            >
                                {t('전투 포기 (도망치기)')}
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
                                className="glass px-8 rounded-2xl bg-white/5 text-center"
                            >
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => startBattle(selectedDungeon)}
                                        className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <Swords className="h-4 w-4" /> {t('다시 도전')}
                                    </button>
                                    <button
                                        onClick={exitBattle}
                                        className="px-3 py-1.5 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                    >
                                        {t('다른 던전 선택')}
                                    </button>
                                </div>

                                {/* 보유 식품 목록 및 사용 버튼 */}
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-foreground/50 mb-4">{t('배고파..?')}</h4>
                                    <div className="space-y-3">
                                        {inventory
                                            .filter(entry => entry.item.type === 'food')
                                            .map((entry, idx) => {
                                                const item = entry.item;
                                                return (
                                                    <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <span className="text-2xl">{item.emoji}</span>
                                                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-foreground text-background text-[10px] font-bold">
                                                                    {entry.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="text-left">
                                                                <div className={`text-sm font-bold ${ITEM_RARITY_TEXT[item.rarity]}`}>{t(item.name)}</div>
                                                                <div className="text-[10px] text-foreground/40">{t(item.rarity)}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUseFood(item.id)}
                                                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-500 text-xs font-bold hover:bg-green-500/30 transition-colors flex items-center gap-1.5"
                                                        >
                                                            {t('먹이기')}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        {inventory.filter(entry => entry.item.type === 'food').length === 0 && (
                                            <p className="text-sm text-foreground/40 italic py-4">{t('보유 중인 식품이 없습니다.')}</p>
                                        )}
                                    </div>
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
                                <h3 className="text-2xl font-black mb-2">{t('패배...')}</h3>
                                <p className="text-foreground/60 mb-4">{t('다음에는 더 강해져서 돌아오자!')}</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => { router.push("/superpet/room") }}
                                        className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                    >
                                        {t('집으로...')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-4 py-2 lg:p-12">
                    <div className="text-center mb-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tighter mb-3 lg:mb-12"
                        >
                            {lang === 'ko'
                                ? <>던전 <span className="text-red-500">탐험</span></>
                                : <>{t('던전')} <span className="text-red-500">Exploration</span></>
                            }
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-foreground/60"
                        >
                            <span className="font-bold text-foreground">{character.name}</span> (Lv.{character.level} {ELEMENT_EMOJI[character.element]} {t(character.className)}) {t('으로 도전!')}
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
                                    <h3 className="text-lg font-bold mb-1">{t(dungeon.name)}</h3>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                        {dungeon.levelRange}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/60 leading-relaxed mb-4 flex-1">
                                    {t(dungeon.description)}
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
                                    <Swords className="h-4 w-4" /> {t('도전하기')}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
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
