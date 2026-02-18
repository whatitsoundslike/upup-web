'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '@/components/AuthProvider';
import { loadCharacter, addItemToInventory, addGoldToCharacter } from '../types';
import { useDebouncedSave } from '../gameSync';
import {
    MISSIONS,
    type MissionDef,
    checkAndResetMissionDate,
    getMissionCounter,
    isMissionClaimed,
    markMissionClaimed,
} from './missionData';

interface MissionState {
    def: MissionDef;
    progress: number;
    claimed: boolean;
    claimable: boolean;
}

export default function Mission() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const debouncedSaveToServer = useDebouncedSave();
    const [missions, setMissions] = useState<MissionState[]>([]);
    const [claimModal, setClaimModal] = useState<MissionDef | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [hasCharacter, setHasCharacter] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const loadMissionState = useCallback(() => {
        checkAndResetMissionDate();
        const character = loadCharacter();
        setHasCharacter(!!character);

        const states: MissionState[] = MISSIONS.map((def) => {
            const claimed = isMissionClaimed(def.claimedKey);
            const progress = def.counterKey
                ? Math.min(getMissionCounter(def.counterKey), def.target)
                : claimed ? 1 : 0;
            const claimable = !claimed && progress >= def.target;
            return { def, progress, claimed, claimable };
        });

        // 출석체크는 캐릭터가 있으면 항상 수령 가능 (미수령 시)
        const attendance = states.find(s => s.def.key === 'attendance');
        if (attendance && !attendance.claimed && character) {
            attendance.claimable = true;
            attendance.progress = 1;
        }

        setMissions(states);
    }, []);

    // 초기 로드 + 서버 클레임 동기화
    useEffect(() => {
        loadMissionState();

        if (user) {
            fetch('/api/superpet/mission')
                .then(res => res.json())
                .then(data => {
                    if (data.claimed && Array.isArray(data.claimed)) {
                        for (const key of data.claimed) {
                            const mission = MISSIONS.find(m => m.key === key);
                            if (mission) {
                                markMissionClaimed(mission.claimedKey);
                            }
                        }
                        loadMissionState();
                    }
                })
                .catch(() => { });
        }
    }, [user, loadMissionState]);

    // 2초마다 카운터 갱신 (던전에서 킬 시 실시간 반영)
    useEffect(() => {
        const interval = setInterval(loadMissionState, 2000);
        return () => clearInterval(interval);
    }, [loadMissionState]);

    const handleClaim = async (def: MissionDef) => {
        if (claiming) return;

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setClaiming(true);

        try {
            // 서버에 로그 저장
            {
                const res = await fetch('/api/superpet/mission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ missionKey: def.key }),
                });
                const data = await res.json();
                if (!res.ok && data.error === '이미 오늘 보상을 받았습니다.') {
                    markMissionClaimed(def.claimedKey);
                    loadMissionState();
                    setClaiming(false);
                    return;
                }
            }

            // 보상 지급
            if (def.rewardType === 'feed') {
                addItemToInventory('feed', def.rewardAmount);
            } else {
                addGoldToCharacter(def.rewardAmount);
            }

            markMissionClaimed(def.claimedKey);
            debouncedSaveToServer();
            loadMissionState();
            setClaimModal(def);
        } catch {
            // 네트워크 에러 시에도 클라이언트 보상 지급
            if (def.rewardType === 'feed') {
                addItemToInventory('feed', def.rewardAmount);
            } else {
                addGoldToCharacter(def.rewardAmount);
            }
            markMissionClaimed(def.claimedKey);
            debouncedSaveToServer();
            loadMissionState();
            setClaimModal(def);
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div className="px-4 py-6 md:py-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-black mb-6 md:text-3xl">{t('일일 미션')}</h1>

            {!hasCharacter && (
                <div className="text-center py-10 text-foreground/50">
                    <p className="text-lg">{t('미션을 완료하려면 먼저 캐릭터를 생성하세요!')}</p>
                </div>
            )}

            {hasCharacter && (
                <div className="flex flex-col gap-4">
                    {missions.map((mission) => (
                        <MissionCard
                            key={mission.def.key}
                            mission={mission}
                            onClaim={handleClaim}
                            claiming={claiming}
                        />
                    ))}
                </div>
            )}

            {/* 보상 수령 모달 */}
            <AnimatePresence>
                {claimModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setClaimModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-400"
                        >
                            <div className="text-center mb-6">
                                <motion.div
                                    className="text-6xl mb-3"
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                                >
                                    {claimModal.rewardType === 'feed' ? '🥫' : '💰'}
                                </motion.div>
                                <h3 className="text-xl font-black mb-2">{t('미션 완료!')}</h3>
                                <p className="text-sm text-foreground/60 mb-1">
                                    {t(claimModal.name)}
                                </p>
                                <p className="text-lg font-bold text-amber-500">
                                    {t(claimModal.rewardLabel)} {t('획득!')}
                                </p>
                            </div>
                            <button
                                onClick={() => setClaimModal(null)}
                                className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 로그인 필요 모달 */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-foreground/10"
                        >
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-3">🔒</div>
                                <h3 className="text-xl font-black mb-2">{t('로그인이 필요합니다')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {t('미션 보상을 받으려면 로그인해주세요.')}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('취소')}
                                </button>
                                <button
                                    onClick={() => router.push('/login?callbackUrl=/superpet/mission')}
                                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                                >
                                    {t('로그인')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MissionCard({
    mission,
    onClaim,
    claiming,
}: {
    mission: MissionState;
    onClaim: (def: MissionDef) => void;
    claiming: boolean;
}) {
    const { t } = useLanguage();
    const { def, progress, claimed, claimable } = mission;
    const progressPercent = def.target > 1 ? Math.min((progress / def.target) * 100, 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative rounded-2xl p-4 md:p-5 shadow-lg transition-all
                bg-zinc-50 dark:bg-zinc-900 border-2
                ${claimable
                    ? 'border-amber-400 shadow-amber-400/20 shadow-lg'
                    : claimed
                        ? 'border-green-500/30'
                        : 'border-foreground/10'
                }
            `}
        >
            {/* 수령 가능 시 글로우 효과 */}
            {claimable && (
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-4">
                {/* 아이콘 */}
                <div className="text-3xl md:text-4xl flex-shrink-0">{def.icon}</div>

                {/* 미션 정보 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base md:text-lg">{t(def.name)}</h3>
                        {claimed && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold">
                                {t('완료')}
                            </span>
                        )}
                    </div>
                    <p className="text-xs md:text-sm text-foreground/50 mb-2">{t(def.description)}</p>

                    {/* 프로그레스 바 (카운터가 있는 미션) */}
                    {def.target > 1 && (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 rounded-full bg-foreground/10 overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${claimed
                                        ? 'bg-green-500'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="text-xs font-bold text-foreground/60 whitespace-nowrap">
                                {progress}/{def.target}
                            </span>
                        </div>
                    )}
                </div>

                {/* 보상 + 버튼 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold text-amber-500">{t(def.rewardLabel)}</span>
                    {claimed ? (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/15 flex items-center justify-center">
                            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                        </div>
                    ) : claimable ? (
                        <button
                            onClick={() => onClaim(def)}
                            disabled={claiming}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors animate-bounce"
                        >
                            <Gift className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                            <Gift className="w-5 h-5 md:w-6 md:h-6 text-foreground/20" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
