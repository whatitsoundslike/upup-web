'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CraftingRecipe } from '../craftingData';
import { GAME_ITEMS } from '../itemData';
import { useLanguage } from '../i18n/LanguageContext';

export interface CraftingResult {
    success: boolean;
    itemId: string;
    quantity: number;
}

interface CraftingModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: CraftingRecipe | null;
    onComplete: (result: CraftingResult) => void;
}

export default function CraftingModal({ isOpen, onClose, recipe, onComplete }: CraftingModalProps) {
    const { t, lang } = useLanguage();
    const [phase, setPhase] = useState<'animating' | 'result'>('animating');
    const [result, setResult] = useState<CraftingResult | null>(null);
    const [progress, setProgress] = useState(0);

    const ANIMATION_DURATION = 3000; // 3초

    useEffect(() => {
        if (!isOpen || !recipe) {
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

        // 3초 후 제작 결과 판정
        const timer = setTimeout(() => {
            clearInterval(progressInterval);
            setProgress(100);

            // 성공 확률 계산
            const isSuccess = Math.random() * 100 < recipe.successRate;

            const craftingResult: CraftingResult = {
                success: isSuccess,
                itemId: recipe.resultItemId,
                quantity: isSuccess ? recipe.resultQuantity : 0,
            };

            setResult(craftingResult);
            setPhase('result');
        }, ANIMATION_DURATION);

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [isOpen, recipe]);

    const handleClose = () => {
        if (result) {
            onComplete(result);
        }
        onClose();
    };

    const resultItem = recipe ? GAME_ITEMS[recipe.resultItemId] : null;
    const itemName = resultItem?.name || '아이템';

    return (
        <AnimatePresence>
            {isOpen && recipe && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 pb-20 md:pb-0"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-900 border border-zinc-700"
                    >
                        {phase === 'animating' && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-bold text-purple-400 mb-4">
                                    {t(itemName)} {lang === 'ko' ? '제작 중...' : 'Crafting...'}
                                </h3>

                                {/* 용광로/제작 애니메이션 */}
                                <div className="relative h-40 w-40 mb-4">
                                    {/* 가마솥/용광로 */}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-6xl"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                        }}
                                    >
                                        🏺
                                    </motion.div>

                                    {/* 불꽃 효과 */}
                                    <motion.div
                                        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-3xl"
                                        animate={{
                                            y: [-5, -10, -5],
                                            opacity: [0.8, 1, 0.8],
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            repeat: Infinity,
                                        }}
                                    >
                                        🔥
                                    </motion.div>

                                    {/* 마법 파티클 1 */}
                                    <motion.div
                                        className="absolute bottom-16 left-[35%] text-xl"
                                        animate={{
                                            y: [0, -30, -60],
                                            opacity: [0, 1, 0],
                                            x: [-5, -10, -15],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: 0,
                                        }}
                                    >
                                        ✨
                                    </motion.div>

                                    {/* 마법 파티클 2 */}
                                    <motion.div
                                        className="absolute bottom-16 left-[65%] text-xl"
                                        animate={{
                                            y: [0, -30, -60],
                                            opacity: [0, 1, 0],
                                            x: [5, 10, 15],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: 0.3,
                                        }}
                                    >
                                        💫
                                    </motion.div>

                                    {/* 마법 파티클 3 */}
                                    <motion.div
                                        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xl"
                                        animate={{
                                            y: [0, -40, -80],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0.5,
                                        }}
                                    >
                                        🌟
                                    </motion.div>
                                </div>

                                {/* 프로그레스 바 */}
                                <div className="w-full mb-2">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>{lang === 'ko' ? '제작 진행중' : 'Crafting'}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-zinc-700 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-400 text-center">
                                    {lang === 'ko' ? '성공률' : 'Success Rate'}: {recipe.successRate}%
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
                                            {lang === 'ko' ? '제작 성공!' : 'Crafting Success!'}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-3xl">{resultItem?.emoji}</span>
                                            <span className="text-lg font-bold">{t(itemName)}</span>
                                            <span className="text-amber-400 font-bold">x{result.quantity}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', bounce: 0.3 }}
                                            className="text-7xl mb-4"
                                        >
                                            💨
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-red-400 mb-2">
                                            {lang === 'ko' ? '제작 실패...' : 'Crafting Failed...'}
                                        </h3>
                                        <p className="text-sm text-zinc-400 mb-4">
                                            {lang === 'ko' ? '재료가 모두 소모되었습니다.' : 'All materials have been consumed.'}
                                        </p>
                                    </>
                                )}

                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors"
                                >
                                    {lang === 'ko' ? '확인' : 'OK'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
