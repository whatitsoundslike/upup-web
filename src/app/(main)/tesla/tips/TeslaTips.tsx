'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Calendar, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTipData, type TipItem } from './tipData';

export default function TeslaTips() {
    const [tips, setTips] = useState<TipItem[]>([]);

    useEffect(() => {
        fetchTipData().then(setTips);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Tesla Tips</h1>
                </div>
                <p className="text-foreground/60 text-lg">테슬라 오너들을 위한 유용한 꿀팁과 가이드를 공유합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tips.map((tip, idx) => (
                    <Link
                        key={tip.id}
                        href={`/tesla/tips/${tip.id}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass group rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all h-full cursor-pointer"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={tip.thumbnail}
                                    alt={tip.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-tesla-red transition-colors line-clamp-1">
                                    {tip.title}
                                </h3>
                                <p className="text-sm text-foreground/60 line-clamp-3 mb-6 flex-grow">
                                    {tip.summary}
                                </p>

                                <div className="text-sm font-bold flex items-center gap-1 text-foreground/40 group-hover:text-tesla-red transition-all mt-auto self-start">
                                    자세히 보기 <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {tips.length === 0 && (
                <div className="text-center py-20 text-foreground/40 font-medium">
                    아직 등록된 팁이 없습니다.
                </div>
            )}
        </div>
    );
}
