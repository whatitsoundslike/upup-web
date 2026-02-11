'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, MessageSquare } from 'lucide-react';

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

interface MemoryOrbProps {
    type: 'item' | 'record';
    data: Item | Record;
    size?: number;
    onClick?: () => void;
    delay?: number;
}

export default function MemoryOrb({ type, data, size = 64, onClick, delay = 0 }: MemoryOrbProps) {
    const hasImage = data.images && data.images.length > 0;
    const imageUrl = hasImage ? data.images[0] : null;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="relative cursor-pointer group"
            style={{ width: size, height: size }}
        >
            {/* 메인 원형 */}
            <div
                className={`relative w-full h-full rounded-full overflow-hidden transition-shadow duration-200 ${
                    type === 'item'
                        ? 'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 group-hover:shadow-lg group-hover:shadow-rose-200/50 dark:group-hover:shadow-rose-900/30'
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:shadow-lg group-hover:shadow-blue-200/50 dark:group-hover:shadow-blue-900/30'
                }`}
            >
                {/* 이미지 또는 아이콘 */}
                {imageUrl ? (
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {type === 'item' ? (
                            <ShoppingBag className="w-6 h-6 text-rose-400 dark:text-rose-300" />
                        ) : (
                            <MessageSquare className="w-6 h-6 text-blue-400 dark:text-blue-300" />
                        )}
                    </div>
                )}
            </div>

            {/* 타입 인디케이터 */}
            <div
                className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ${
                    type === 'item' ? 'bg-rose-500' : 'bg-blue-500'
                }`}
            >
                {type === 'item' ? (
                    <ShoppingBag className="w-2.5 h-2.5" />
                ) : (
                    <MessageSquare className="w-2.5 h-2.5" />
                )}
            </div>
        </motion.div>
    );
}
