'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ToyHome() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">
                    <Gamepad2 className="inline-block h-12 w-12 mr-4 text-tesla-red" />
                    Toy Store
                </h1>
                <p className="text-foreground/60 text-xl">
                    최고의 장난감과 게임을 만나보세요
                </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
                <Link href="/toy/catalog">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-8 rounded-2xl border border-foreground/10 hover:border-tesla-red transition-all cursor-pointer"
                    >
                        <Gamepad2 className="h-12 w-12 mb-4 text-tesla-red" />
                        <h2 className="text-2xl font-bold mb-2">카탈로그</h2>
                        <p className="text-foreground/60">다양한 장난감을 둘러보세요</p>
                    </motion.div>
                </Link>

                <Link href="/toy/reviews">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-8 rounded-2xl border border-foreground/10 hover:border-tesla-red transition-all cursor-pointer"
                    >
                        <Star className="h-12 w-12 mb-4 text-tesla-red" />
                        <h2 className="text-2xl font-bold mb-2">리뷰</h2>
                        <p className="text-foreground/60">사용자 리뷰를 확인하세요</p>
                    </motion.div>
                </Link>

                <Link href="/toy/guide">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-8 rounded-2xl border border-foreground/10 hover:border-tesla-red transition-all cursor-pointer"
                    >
                        <TrendingUp className="h-12 w-12 mb-4 text-tesla-red" />
                        <h2 className="text-2xl font-bold mb-2">가이드</h2>
                        <p className="text-foreground/60">선택 가이드를 읽어보세요</p>
                    </motion.div>
                </Link>
            </div>
        </div>
    );
}
