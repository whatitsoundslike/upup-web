'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, MessageSquare, ArrowRight, Newspaper, Lightbulb, Bot } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: '뉴스',
        desc: 'AI 기술의 최신 동향과 뉴스를 실시간으로 확인하세요.',
        icon: Newspaper,
        href: '/ai/news',
        color: 'text-cyan-500'
    },
    {
        title: '팁',
        desc: 'ChatGPT, Claude, Gemini 등 AI 도구 활용 꿀팁과 프롬프트 공유.',
        icon: Lightbulb,
        href: '/ai/tips',
        color: 'text-purple-500'
    },
    {
        title: '샵',
        desc: 'AI 서비스 구독권, API 크레딧, AI 관련 도구 모음.',
        icon: ShoppingBag,
        href: '/ai/shop',
        color: 'text-emerald-500'
    },
    {
        title: '룸',
        desc: 'AI 개발자, 사용자들과 소통하며 정보를 나눠보세요.',
        icon: MessageSquare,
        href: '/ai/room',
        color: 'text-blue-500'
    }
];

export default function AIHome() {
    return (
        <div className="relative overflow-hidden">
            <section className="py-16 bg-foreground/5 min-h-[80vh] flex items-center">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block mb-4"
                        >
                            <Bot className="h-16 w-16 text-cyan-500 mx-auto" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter mb-4 uppercase"
                        >
                            AI <span className="text-cyan-500">ROOM</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-foreground/60 text-xl"
                        >
                            인공지능의 모든 것, 트렌드부터 실전 활용까지
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                    className="text-sm font-bold flex items-center gap-1 hover:text-cyan-500 transition-colors"
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
