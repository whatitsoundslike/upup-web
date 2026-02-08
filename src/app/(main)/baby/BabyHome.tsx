'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Cpu, ArrowRight, Newspaper, Lightbulb } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: '뉴스',
        desc: '육아와 관련된 최신 뉴스와 정보를 확인하세요.',
        icon: Newspaper,
        href: '/baby/news',
        color: 'text-purple-500'
    },
    {
        title: '육아정보',
        desc: '아이를 키우는 데 꼭 필요한 꿀팁과 정보를 확인하세요.',
        icon: Lightbulb,
        href: '/baby/info',
        color: 'text-pink-500'
    },
    {
        title: '육아 Shop',
        desc: '엄마 아빠가 인정한 최고의 육아 아이템.',
        icon: ShoppingBag,
        href: '/baby/shop',
        color: 'text-orange-500'
    },
    {
        title: '룸',
        desc: '육아 동지들과 소통하며 육아 스트레스를 날려버리세요.',
        icon: Cpu,
        href: '/baby/room',
        color: 'text-blue-500'
    }
];

export default function BabyHome() {
    return (
        <div className="relative overflow-hidden">
            <section className="py-16 bg-foreground/5 min-h-[80vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter mb-4 uppercase"
                        >
                            육아 <span className="text-pink-500">ROOM</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-foreground/60 text-xl"
                        >
                            행복한 육아를 위한 모든 정보와 커뮤니티
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-8 rounded-2xl group transition-all shadow-lg bg-white/5"
                            >
                                <div className={`p-3 rounded-xl bg-white/10 w-fit mb-6 ${feature.color}`}>
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-sm text-foreground/60 leading-relaxed mb-6">
                                    {feature.desc}
                                </p>
                                <Link
                                    href={feature.href}
                                    className="text-sm font-bold flex items-center gap-1 hover:text-pink-500 transition-colors"
                                >
                                    자세히 보기 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
