'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addItemToInventory, loadCharacter } from '../types';
import { getItem, setItem } from '../storage';

const FEED_INTERVAL = 10 * 60 * 1000; // 10 minutes

export default function FeedReward() {
    const [showModal, setShowModal] = useState(false);
    const [characterName, setCharacterName] = useState('');

    const grantFeed = useCallback(() => {
        const character = loadCharacter();
        if (!character) return;

        addItemToInventory('feed', 10);
        setItem('last-feed-time', Date.now().toString());
        setCharacterName(character.name);
        setShowModal(true);
    }, []);

    useEffect(() => {
        const stored = getItem('last-feed-time');
        if (!stored) {
            setItem('last-feed-time', Date.now().toString());
        }

        const check = () => {
            const last = Number(getItem('last-feed-time') || Date.now());
            if (Date.now() - last >= FEED_INTERVAL) {
                grantFeed();
            }
        };

        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [grantFeed]);

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-400"
                    >
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-3">🥫</div>
                            <h3 className="text-xl font-black mb-2">간식 도착!</h3>
                            <p className="text-sm text-foreground/60">
                                <span className="font-bold text-foreground">{characterName}</span>을(를) 위한 간식이 도착했어요!
                            </p>
                            <p className="mt-2 text-sm font-semibold text-amber-600">
                                사료 x10 획득!
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                        >
                            확인
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
