'use client';

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, ArrowRight, DockIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
    {
        title: '뉴스',
        desc: '테슬라 뉴스를 확인하세요.',
        icon: DockIcon,
        href: '/tesla/news',
        color: 'text-blue-500'
    },
    {
        title: '보조금 현황',
        desc: '2026년 지자체별 전기차 보조금 잔여 현황을 확인하세요.',
        icon: Zap,
        href: '/tesla/subsidy',
        color: 'text-blue-500'
    },
    {
        title: '악세사리 Shop',
        desc: '당신의 테슬라를 위한 머스트-해브 아이템.',
        icon: ShieldCheck,
        href: '/tesla/shop',
        color: 'text-tesla-red'
    },
    {
        title: '룸',
        desc: '테슬라 오너들의 차에는 무엇이 있을까요? 사용자들의 꿀팁 확인하기.',
        icon: Cpu,
        href: '/tesla/room',
        color: 'text-emerald-500'
    },
];

interface NewsItem {
    source: string;
    title: string;
    link: string;
    thumbnail: string | null;
    description?: string;
    published_at: string | null;
}

export function get4HourVersion(date = new Date()) {
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    return Math.floor(date.getTime() / FOUR_HOURS);
}

export default function TeslaHome() {
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('https://cdn.jsdelivr.net/gh/grapheople/jroom@main/json/tesla_news.json?v=' + get4HourVersion());
                const data = await response.json();
                const shuffled = [...data].sort(() => Math.random() - 0.5);
                setNewsData(shuffled.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch news:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b -z-10" />
            <section className="py-5 bg-foreground/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-8 rounded-2xl group transition-all shadow-lg"
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
                                    className="text-sm font-bold flex items-center gap-1 group-hover:text-tesla-red transition-colors"
                                >
                                    자세히 보기 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-5 max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-4">LATEST NEWS</h2>
                        <p className="text-foreground/60">테슬라와 전기차 시장의 가장 빠른 소식</p>
                    </div>
                    <Link href="/tesla/news" className="text-sm font-bold hover:text-tesla-red transition-colors">전체보기</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsData.map((item, idx) => (
                        <Link href={item.link} key={idx} target="_blank" rel="noopener noreferrer">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col gap-6 p-4 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer border border-transparent hover:border-foreground/10"
                            >
                                <div className="w-full h-48 flex-shrink-0 bg-foreground/5 rounded-xl overflow-hidden relative">
                                    {item.thumbnail ? (
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <img
                                            src="/default_thumbnail.png"
                                            alt="Default Thumbnail"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col justify-center flex-grow">
                                    <h3 className="font-bold text-xl leading-tight mb-2 group-hover:text-tesla-red transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
