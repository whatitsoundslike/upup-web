'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Inbox, Plus, LogIn, UserPlus, Lock, Home, ArrowLeft } from 'lucide-react';
import FeedCard from './FeedCard';
import { useAuth } from '@/components/AuthProvider';
import type { FeedItem } from '@/app/api/rooms/feed/route';

interface RoomFeedProps {
    category: string;
}

export default function RoomFeed({ category }: RoomFeedProps) {
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [myRoomId, setMyRoomId] = useState<string | null>(null);

    const fetchFeed = useCallback(async (cursor?: string) => {
        try {
            const url = new URL('/api/rooms/feed', window.location.origin);
            url.searchParams.set('category', category);
            if (cursor) {
                url.searchParams.set('cursor', cursor);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('피드를 불러오는데 실패했습니다.');

            const data = await res.json();
            return data;
        } catch (err) {
            throw err;
        }
    }, [category]);

    const fetchMyRoom = useCallback(async () => {
        try {
            const url = new URL('/api/rooms', window.location.origin);
            url.searchParams.set('category', category);
            url.searchParams.set('my', 'true');

            const res = await fetch(url.toString());
            if (!res.ok) return;

            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setMyRoomId(data[0].id);
            }
        } catch {
            // 내 룸 조회 실패는 무시
        }
    }, [category]);

    const loadInitial = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchFeed();
            setItems(data.items);
            setNextCursor(data.nextCursor);
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [fetchFeed]);

    // Stable callback reference (rerender-functional-setstate)
    const loadMore = useCallback(async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const data = await fetchFeed(nextCursor);
            setItems(prev => [...prev, ...data.items]);
            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error('Failed to load more:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [nextCursor, loadingMore, fetchFeed]);

    useEffect(() => {
        if (!authLoading && user) {
            loadInitial();
            fetchMyRoom();
        }
    }, [loadInitial, fetchMyRoom, authLoading, user]);

    // 무한 스크롤
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 500
            ) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [nextCursor, loadingMore]);

    // 인증 로딩 중
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    // 비로그인 상태
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
                        Room에서 다른 사람들의 아이템과 기록을 구경하고,<br />
                        내 아이템과 기록도 등록해보세요!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-tesla-red text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
                        >
                            <LogIn className="w-5 h-5" />
                            로그인
                        </Link>
                        <Link
                            href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`}
                            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:border-tesla-red hover:text-tesla-red transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            회원가입
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 피드 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={loadInitial}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tesla-red text-white hover:bg-red-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    다시 시도
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-gray-500 dark:text-gray-400">
                <Inbox className="w-16 h-16" />
                <p className="text-lg font-medium">아직 등록된 콘텐츠가 없습니다</p>
                <p className="text-sm mb-4">첫 번째 아이템이나 기록을 등록해보세요!</p>
                {!myRoomId && (
                    <Link
                        href={`/${category}/room/new`}
                        className="flex items-center gap-2 px-6 py-3 bg-tesla-red text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        새 콘텐츠 등록
                    </Link>
                )}

                {/* 좌측 하단 - 뒤로가기 */}
                <Link
                    href={`/${category}`}
                    className="fixed bottom-24 md:bottom-8 left-4 md:left-8 w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors z-40"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                {/* 우측 하단 버튼들 */}
                <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 flex items-center gap-2 z-40">
                    {/* 내 룸 가기 버튼 */}
                    {myRoomId && (
                        <Link
                            href={`/${category}/room/${myRoomId}`}
                            className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                        </Link>
                    )}

                    {/* 새 콘텐츠 등록 버튼 */}
                    {!myRoomId && (
                        <Link
                            href={`/${category}/room/new`}
                            className="w-12 h-12 bg-tesla-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
            <AnimatePresence>
                {items.map((item) => (
                    <FeedCard key={`${item.type}-${item.id}`} item={item} category={category} />
                ))}
            </AnimatePresence>

            {loadingMore && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-tesla-red" />
                </div>
            )}

            {!nextCursor && items.length > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400 py-8"
                >
                    모든 콘텐츠를 불러왔습니다
                </motion.p>
            )}

            {/* 좌측 하단 - 뒤로가기 */}
            <Link
                href={`/${category}`}
                className="fixed bottom-24 md:bottom-8 left-4 md:left-8 w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors z-40"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>


            {/* 우측 하단 버튼들 */}
            <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 flex items-center gap-2 z-40">
                {/* 내 룸 가기 버튼 */}
                {myRoomId && (
                    <Link
                        href={`/${category}/room/${myRoomId}`}
                        className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                    </Link>
                )}

                {/* 새 콘텐츠 등록 버튼 */}
                {!myRoomId && <Link
                    href={`/${category}/room/new`}
                    className="w-12 h-12 bg-tesla-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </Link>}
            </div>
        </div>
    );
}
