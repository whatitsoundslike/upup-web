import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Heart, Skull } from 'lucide-react';
import { type ReactNode, type RefObject } from 'react';
import { type Character, ITEM_RARITY_TEXT, getTotalStats, type InventoryItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { type DungeonData, type MonsterData, type BattleState, ELEMENT_EMOJI } from './dungeonData';

interface BattleScreenProps {
    character: Character;
    selectedDungeon: DungeonData;
    selectedMonster: MonsterData;
    battleState: BattleState;
    playerHp: number;
    monsterHp: number;
    battleLog: ReactNode[];
    inventory: InventoryItem[];
    isAttacking: boolean;
    showImpact: boolean;
    impactKey: number;
    attackDistance: number;
    battleFieldRef: RefObject<HTMLDivElement | null>;
    logRef: RefObject<HTMLDivElement | null>;
    feedCountdown: string;
    onStartBattle: (dungeon: DungeonData) => void;
    onExitBattle: () => void;
    onUseFood: (itemId: string) => void;
}

export default function BattleScreen({
    character,
    selectedDungeon,
    selectedMonster,
    battleState,
    playerHp,
    monsterHp,
    battleLog,
    inventory,
    isAttacking,
    showImpact,
    impactKey,
    attackDistance,
    battleFieldRef,
    logRef,
    feedCountdown,
    onStartBattle,
    onExitBattle,
    onUseFood,
}: BattleScreenProps) {
    const { t, lang } = useLanguage();
    const router = useRouter();

    return (
        <div className="max-w-3xl mx-auto px-4 py-2">
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
                                <img src={character.image} alt={character.name} className="w-23 h-40 lg:w-45 lg:h-80 object-cover mx-auto mb-2" />
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
                    className="glass p-2 rounded-2xl bg-white/5 z-9"
                >
                    <div className="text-center mb-4 flex flex-col items-center">
                        <motion.div
                            animate={isAttacking
                                ? { x: -attackDistance, scale: 0.9, rotate: -12 }
                                : { x: 0, scale: 1, rotate: 0 }
                            }
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="text-4xl mb-2 w-25 h-40 lg:w-50 lg:h-80 flex items-center justify-center"
                        >
                            {selectedMonster?.imageUrl ? (
                                <img src={selectedMonster.imageUrl} alt={selectedMonster.name} className="w-21 h-35 lg:w-40 lg:h-70 contain" />
                            ) : selectedMonster?.videoUrl ? (
                                <video src={selectedMonster.videoUrl} autoPlay loop muted playsInline className="w-full h-full contain" />
                            ) : (
                                selectedMonster?.emoji
                            )}
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
            <div ref={logRef} className="glass p-4 rounded-xl bg-white/5 mb-2 h-30 overflow-y-auto">
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
                        onClick={onExitBattle}
                        className="w-full py-3 rounded-xl bg-foreground/5 text-foreground/40 text-sm font-bold hover:bg-foreground/10 transition-colors"
                    >
                        {t('전투 포기')}
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
                        <div className="flex gap-3 justify-center items-center">
                            <button
                                onClick={() => onStartBattle(selectedDungeon)}
                                className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <Swords className="h-4 w-4" /> {t('다음 전투')}
                            </button>
                            <div className="px-3 py-1.5 rounded-xl bg-foreground/5 text-foreground/50 text-sm font-bold flex items-center gap-1.5">
                                🍖 {t('무료 사료')} {feedCountdown}
                            </div>
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
                                                    onClick={() => onUseFood(item.id)}
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
                        <div className="flex gap-3 justify-center items-center">
                            <button
                                onClick={() => { router.push("/superpet/room") }}
                                className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                            >
                                {t('집으로...')}
                            </button>
                            <div className="px-3 py-1.5 rounded-xl bg-foreground/5 text-foreground/50 text-sm font-bold flex items-center gap-1.5">
                                🍖 {t('무료 사료')} {feedCountdown}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
