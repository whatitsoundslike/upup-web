import { motion } from 'framer-motion';
import { Swords, Heart, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { type Character, getTotalStats } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { getItem } from '../storage';
import { type DungeonData, dungeons, ELEMENT_EMOJI } from './dungeonData';

interface DungeonSelectProps {
    character: Character;
    feedCountdown: string;
    onStartBattle: (dungeon: DungeonData) => void;
}

export default function DungeonSelect({ character, feedCountdown, onStartBattle }: DungeonSelectProps) {
    const { t, lang } = useLanguage();

    // 마지막 전투 던전 ID
    const lastDungeonId = useMemo(() => {
        const id = getItem('last-dungeon');
        return id ? Number(id) : null;
    }, []);

    // 마지막 전투 던전을 가장 먼저 표시
    const sortedDungeons = useMemo(() => {
        if (!lastDungeonId) return dungeons;

        return [...dungeons].sort((a, b) => {
            if (a.id === lastDungeonId) return -1;
            if (b.id === lastDungeonId) return 1;
            return 0;
        });
    }, [lastDungeonId]);

    return (
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6 text-sm text-foreground/50"
            >
                <Timer className="h-4 w-4" />
                <span>{t('다음 사료 배달까지')} <span className="font-bold text-amber-500">{feedCountdown}</span></span>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {sortedDungeons.map((dungeon, idx) => (
                    <motion.div
                        key={dungeon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`relative p-6 rounded-2xl bg-white/5 shadow-lg flex flex-col ${dungeon.id === lastDungeonId ? 'border-2 border-amber-500' : 'border-1 border-foreground/20'}`}
                    >
                        {/* 최근 전투 태그 */}
                        {dungeon.id === lastDungeonId && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-lg">
                                {lang === 'ko' ? '최근 전투' : 'Recent'}
                            </div>
                        )}
                        {(() => {
                            const boss = dungeon.monsters.find(m => m.isBoss);
                            if (!boss) return null;
                            return (
                                <div className="mb-4">
                                    <div className="w-full rounded-lg overflow-hidden mb-2">
                                        {boss.imageUrl ? (
                                            <img src={boss.imageUrl} alt={boss.name} className="w-full h-full object-cover" />
                                        ) : boss.videoUrl ? (
                                            <video src={boss.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-foreground/5 text-5xl">{boss.emoji}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">BOSS</span>
                                        <span className="text-xs font-bold text-foreground/60">{t(boss.name)}</span>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold mb-1">{t(dungeon.name)}</h3>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                {dungeon.levelRange}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/60 leading-relaxed mb-4 flex-1">
                            {t(dungeon.description)}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onStartBattle(dungeon)}
                            className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                        >
                            <Swords className="h-4 w-4" /> {t('도전하기')}
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
