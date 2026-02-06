'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EnhanceResult, EquipmentSlot, InventoryItem } from '../types';
import { enhanceEquipment, enhanceEquippedItem, getRequiredScrollType, saveCharacter, loadCharacter, getEnhanceSuccessRate, CEILING_LEVELS } from '../types';

interface EnhanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: {
        type: 'inventory' | 'equipped';
        item: InventoryItem | null;
        slot?: EquipmentSlot;
        instanceId?: string;
    } | null;
    scrollId: string;
    onComplete: (result: EnhanceResult) => void;
}

export default function EnhanceModal({ isOpen, onClose, target, scrollId, onComplete }: EnhanceModalProps) {
    const [phase, setPhase] = useState<'animating' | 'result'>('animating');
    const [result, setResult] = useState<EnhanceResult | null>(null);
    const [progress, setProgress] = useState(0);

    const ANIMATION_DURATION = 3000; // 3초

    const performEnhance = useCallback(() => {
        if (!target) return { success: false, message: '대상이 없습니다.' };

        if (target.type === 'inventory' && target.instanceId) {
            return enhanceEquipment(target.instanceId, scrollId);
        } else if (target.type === 'equipped' && target.slot) {
            return enhanceEquippedItem(target.slot, scrollId);
        }
        return { success: false, message: '잘못된 대상입니다.' };
    }, [target, scrollId]);

    useEffect(() => {
        if (!isOpen) {
            setPhase('animating');
            setResult(null);
            setProgress(0);
            return;
        }

        setPhase('animating');
        setProgress(0);

        // 프로그레스 업데이트
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 2;
            });
        }, ANIMATION_DURATION / 50);

        // 5초 후 강화 결과 판정
        const timer = setTimeout(() => {
            clearInterval(progressInterval);
            setProgress(100);

            const enhanceResult = performEnhance();
            setResult(enhanceResult);
            setPhase('result');

            // 즉시 저장
            const character = loadCharacter();
            if (character) {
                saveCharacter(character);
            }
        }, ANIMATION_DURATION);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [isOpen, performEnhance]);

    const handleClose = () => {
        if (result) {
            onComplete(result);
        }
        onClose();
    };

    const itemName = target?.item?.item.name || '장비';
    const currentLevel = target?.item?.enhanceLevel ?? 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-900 border border-zinc-700"
                    >
                        {phase === 'animating' && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-bold text-amber-400 mb-4">
                                    {itemName} 강화 중...
                                </h3>

                                {/* 모루와 망치 애니메이션 */}
                                <div className="relative h-40 w-40 mb-4">
                                    {/* 모루 */}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-6xl"
                                        animate={{
                                            scale: [1, 1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            repeat: Infinity,
                                            times: [0, 0.5, 0.6, 1],
                                        }}
                                    >
                                        🪨
                                    </motion.div>

                                    {/* 불꽃/스파크 효과 - 망치가 내려칠 때 터짐 */}
                                    <motion.div
                                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-2xl"
                                        animate={{
                                            scale: [0, 0, 1.8, 0],
                                            opacity: [0, 0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            repeat: Infinity,
                                            times: [0, 0.5, 0.6, 1],
                                        }}
                                    >
                                        💥
                                    </motion.div>

                                    {/* 추가 스파크 */}
                                    <motion.div
                                        className="absolute bottom-12 left-[40%] text-lg"
                                        animate={{
                                            scale: [0, 0, 1.5, 0],
                                            opacity: [0, 0, 1, 0],
                                            x: [-10, -10, -20, -30],
                                            y: [0, 0, -10, -20],
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            repeat: Infinity,
                                            times: [0, 0.5, 0.6, 1],
                                        }}
                                    >
                                        ✨
                                    </motion.div>
                                    <motion.div
                                        className="absolute bottom-12 left-[60%] text-lg"
                                        animate={{
                                            scale: [0, 0, 1.5, 0],
                                            opacity: [0, 0, 1, 0],
                                            x: [10, 10, 20, 30],
                                            y: [0, 0, -10, -20],
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            repeat: Infinity,
                                            times: [0, 0.5, 0.6, 1],
                                        }}
                                    >
                                        ✨
                                    </motion.div>

                                    {/* 망치 - 위에서 아래로 내려치기 */}
                                    <motion.div
                                        className="absolute top-0 left-[70%] -translate-x-1/2 text-5xl"
                                        style={{ originX: 0.3, originY: 0.8, transform: 'scaleX(-1)' }}
                                        animate={{
                                            rotate: [30, 30, -50, 30],
                                            y: [0, 0, 50, 0],
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            repeat: Infinity,
                                            times: [0, 0.3, 0.55, 1],
                                            ease: [0.36, 0, 0.66, -0.56],
                                        }}
                                    >
                                        🔨
                                    </motion.div>
                                </div>

                                {/* 프로그레스 바 */}
                                <div className="w-full mb-2">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>+{currentLevel} → +{currentLevel + 1}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-zinc-700 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-400 text-center">
                                    강화 성공률: {Math.round(getEnhanceSuccessRate(currentLevel) * 100)}%
                                    {CEILING_LEVELS.includes(currentLevel) && (
                                        <span className="text-amber-400 ml-2">🛡️ 천장 보호</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {phase === 'result' && result && (
                            <div className="flex flex-col items-center">
                                {result.success ? (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', bounce: 0.5 }}
                                            className="text-7xl mb-4"
                                        >
                                            🎉
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-green-400 mb-2">
                                            강화 성공!
                                        </h3>
                                        <p className="text-lg font-bold mb-2">
                                            {itemName}
                                        </p>
                                        <p className="text-lg text-amber-400 font-bold mb-4">
                                            +{(result.newLevel ?? 1) - 1} → +{result.newLevel}
                                        </p>
                                        {result.isMaxLevel && (
                                            <p className="text-sm text-purple-400 mb-4">
                                                🌟 최대 강화 달성!
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', bounce: 0.3 }}
                                            className="text-7xl mb-4"
                                        >
                                            💔
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-red-400 mb-2">
                                            강화 실패...
                                        </h3>
                                        <p className="text-lg font-bold mb-2">
                                            {itemName} +{result.newLevel}
                                        </p>
                                        <p className="text-sm text-zinc-400 mb-4">
                                            {result.newLevel === currentLevel ? (
                                                <span className="text-amber-400">🛡️ 천장 보호로 강화 수치가 유지됩니다.</span>
                                            ) : (
                                                <span>강화 수치가 1 하락했습니다.</span>
                                            )}
                                        </p>
                                    </>
                                )}

                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors"
                                >
                                    확인
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
