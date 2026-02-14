'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Settings } from 'lucide-react';
import MemoryOrb from './MemoryOrb';

interface Item {
    id: string;
    name: string | null;
    description: string | null;
    images: string[];
    sale: boolean;
    price: string;
    buyUrl: string | null;
    purchasedAt: string | null;
    createdAt: string;
}

interface Record {
    id: string;
    text: string | null;
    images: string[];
    createdAt: string;
}

interface RoomProps {
    room: {
        id: string;
        name: string | null;
        description: string | null;
        images: string[];
        isLocked?: boolean;
        items: Item[];
        records: Record[];
        member: { name: string | null };
    };
    isOwner?: boolean;
    onOrbClick?: (type: 'item' | 'record', data: Item | Record) => void;
    onSettingsClick?: () => void;
}

// Hoisted constant (rendering-hoist-jsx)
const ORB_SIZE = 64;

export default function Room({ room, isOwner, onOrbClick, onSettingsClick }: RoomProps) {
    // Memoized combined orbs array (rerender-derived-state)
    const allOrbs = useMemo(() => [
        ...room.items.map((item) => ({ type: 'item' as const, data: item })),
        ...room.records.map((record) => ({ type: 'record' as const, data: record })),
    ], [room.items, room.records]);

    return (
        <div className="relative w-full min-h-[80vh] bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            {room.isLocked && <Lock className="w-5 h-5 text-zinc-400" />}
                            {room.name || 'My Room'}
                        </h1>
                        {isOwner && onSettingsClick && (
                            <button
                                onClick={onSettingsClick}
                                className="p-1.5 text-black hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {room.member.name || '익명'}
                    </p>
                    {room.description && (
                        <p className="text-zinc-600 dark:text-zinc-300 mt-2">
                            {room.description}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* 구분선 */}
            <div className="max-w-2xl mx-auto px-6">
                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* 메모리 오브 그리드 */}
            <div className="px-6 py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                            아이템과 기록
                        </h2>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {allOrbs.length} items
                        </span>
                    </div>

                    {allOrbs.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                            {allOrbs.map((orb, idx) => (
                                <motion.div
                                    key={`${orb.type}-${orb.data.id}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="flex justify-center"
                                >
                                    <MemoryOrb
                                        type={orb.type}
                                        data={orb.data}
                                        size={ORB_SIZE}
                                        onClick={() => onOrbClick?.(orb.type, orb.data)}
                                        delay={0}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <span className="text-2xl">🔮</span>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                아직 등록된 아이템이 없습니다
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
