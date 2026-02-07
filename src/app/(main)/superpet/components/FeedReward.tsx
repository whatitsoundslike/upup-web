'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addItemToInventory, loadCharacter } from '../types';
import { getItem, setItem, removeItem } from '../storage';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '@/components/AuthProvider';

const FEED_INTERVAL = 30 * 60 * 1000; // 30 minutes

export default function FeedReward() {
    const { t, lang } = useLanguage();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [characterName, setCharacterName] = useState('');
    const prevUserRef = useRef<typeof user>(undefined);

    const showFeedPopup = useCallback(() => {
        const character = loadCharacter();
        if (!character) return;

        setCharacterName(character.name);
        setShowModal(true);
    }, []);

    const claimFeed = useCallback(() => {
        addItemToInventory('feed', 10);
        setItem('last-feed-time', Date.now().toString());
        setShowModal(false);
    }, []);

    // 로그인 상태 변화 감지: 로그아웃 시 타이머 초기화, 로그인 시 새로 시작
    useEffect(() => {
        const prevUser = prevUserRef.current;

        // 로그아웃 감지: 이전에 user가 있었는데 지금은 없음
        if (prevUser && !user) {
            removeItem('last-feed-time');
        }

        // 로그인 감지: 이전에 user가 없었는데 지금은 있음
        if (!prevUser && user) {
            // 로그인 시 현재 시간으로 초기화 (30분 후에 지급)
            setItem('last-feed-time', Date.now().toString());
        }

        prevUserRef.current = user;
    }, [user]);

    // 로그인한 사용자만 급식 체크
    useEffect(() => {
        if (!user) return; // 로그인하지 않은 사용자는 체크하지 않음

        // 로그인했는데 last-feed-time이 없으면 설정
        const stored = getItem('last-feed-time');
        if (!stored) {
            setItem('last-feed-time', Date.now().toString());
        }

        const check = () => {
            const last = Number(getItem('last-feed-time') || Date.now());
            if (Date.now() - last >= FEED_INTERVAL) {
                showFeedPopup();
            }
        };

        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [user, showFeedPopup]);

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
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
                            <h3 className="text-xl font-black mb-2">{t('간식 도착!')}</h3>
                            <p className="text-sm text-foreground/60">
                                {lang === 'ko'
                                    ? <><span className="font-bold text-foreground">{characterName}</span>을(를) 위한 간식이 도착했어요!</>
                                    : <>A snack has arrived for <span className="font-bold text-foreground">{characterName}</span>!</>
                                }
                            </p>
                            <p className="mt-2 text-sm font-semibold text-amber-600">
                                {t('사료')} x10 {t('획득')}!
                            </p>
                        </div>
                        <button
                            onClick={claimFeed}
                            className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                        >
                            {t('확인')}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
