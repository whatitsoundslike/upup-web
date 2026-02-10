'use client';

import { motion } from 'framer-motion';
import MemoryOrb from './MemoryOrb';

interface Item {
    id: string;
    name: string | null;
    images: string[];
    sale: boolean;
    price: string;
    buyUrl: string | null;
}

interface Record {
    id: string;
    text: string | null;
    images: string[];
}

interface Room2DProps {
    room: {
        id: string;
        name: string | null;
        description: string | null;
        images: string[];
        items: Item[];
        records: Record[];
        member: { name: string | null };
    };
    onOrbClick?: (type: 'item' | 'record', data: Item | Record) => void;
}

export default function Room2D({ room, onOrbClick }: Room2DProps) {
    const allOrbs = [
        ...room.items.map((item) => ({ type: 'item' as const, data: item })),
        ...room.records.map((record) => ({ type: 'record' as const, data: record })),
    ];

    const orbSize = 64;

    return (
        <div className="relative w-full min-h-[80vh] bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {room.name || 'My Room'}
                    </h1>
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
                            Memories
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
                                        size={orbSize}
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
                                아직 등록된 기억이 없습니다
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* 안내 */}
            {allOrbs.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center pb-8"
                >
                    <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        구슬을 클릭하여 상세 정보를 확인하세요
                    </p>
                </motion.div>
            )}
        </div>
    );
}
