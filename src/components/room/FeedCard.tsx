'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeedItem } from '@/app/api/rooms/feed/route';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FeedCardProps {
    item: FeedItem;
    category: string;
}

export default function FeedCard({ item, category }: FeedCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = item.images.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    };

    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko });

    const handleBuyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    return (
        <Link href={`/${category}/room/${item.roomId}?select=${item.type}&id=${item.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800 cursor-pointer hover:shadow-md transition-shadow mb-1"
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tesla-red to-red-600 flex items-center justify-center text-white text-sm font-bold">
                        {item.memberName?.[0] || '?'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.memberName || '익명'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800">
                    {item.type === 'item' ? (
                        <ShoppingBag className="w-3.5 h-3.5 text-tesla-red" />
                    ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {item.type === 'item' ? '아이템' : '기록'}
                    </span>
                </div>
            </div>

            {/* 이미지 */}
            {item.images.length > 0 && (
                <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800">
                    <img
                        src={item.images[currentImageIndex]}
                        alt={item.name || item.text || '피드 이미지'}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {item.images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                            idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 컨텐츠 */}
            <div className="px-4 py-3">
                {item.type === 'item' ? (
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {item.name || '이름 없음'}
                        </h3>
                        {item.sale && item.price && (
                            <p className="text-lg font-bold text-tesla-red">
                                ₩{Number(item.price).toLocaleString()}
                            </p>
                        )}
                        {item.buyUrl && (
                            <a
                                href={item.buyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleBuyClick}
                                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                구매 링크
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {item.text || ''}
                    </p>
                )}
            </div>
        </motion.div>
        </Link>
    );
}
