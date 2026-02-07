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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 mb-6 text-sm text-foreground/50"
            >
                <Timer className="h-4 w-4" />
                <span>{t('다음 사료 배달까지')} <span className="font-bold text-amber-500">{feedCountdown}</span></span>
            </motion.div>

            {/* 모바일: 리스트 형태 */}
            <div className="md:hidden flex flex-col gap-3">
                {sortedDungeons.map((dungeon, idx) => {
                    const boss = dungeon.monsters.find(m => m.isBoss);
                    return (
                        <motion.div
                            key={dungeon.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative flex items-center gap-4 p-4 rounded-xl bg-white/5 shadow-lg ${dungeon.id === lastDungeonId ? 'border-2 border-amber-500' : 'border border-foreground/20'}`}
                        >
                            {/* 최근 전투 태그 */}
                            {dungeon.id === lastDungeonId && (
                                <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-lg">
                                    {lang === 'ko' ? '최근 전투' : 'Recent'}
                                </div>
                            )}
                            {/* 보스 이미지 */}
                            <div className="flex-shrink-0 w-16 h-25 rounded-lg overflow-hidden bg-foreground/5">
                                {boss?.imageUrl ? (
                                    <img src={boss.imageUrl} alt={boss.name} className="w-full h-full object-cover" />
                                ) : boss?.videoUrl ? (
                                    <video src={boss.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">{boss?.emoji}</div>
                                )}
                            </div>
                            {/* 던전 정보 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-bold truncate">{t(dungeon.name)}</h3>
                                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-bold">
                                        {dungeon.levelRange}
                                    </span>
                                </div>
                                <p className="text-[11px] text-foreground/50 leading-tight line-clamp-2 mb-1">
                                    {t(dungeon.description)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-foreground/50">
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">BOSS</span>
                                    <span className="truncate">{boss ? t(boss.name) : ''}</span>
                                </div>
                            </div>
                            {/* 도전 버튼 */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onStartBattle(dungeon)}
                                className="flex-shrink-0 px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                            >
                                <Swords className="h-4 w-4" />
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>

            {/* 데스크톱: 그리드 형태 */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
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
