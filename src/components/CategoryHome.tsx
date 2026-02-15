'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShoppingBag, Newspaper, Warehouse, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { NewsItem } from '@/components/newsData';

interface FeatureItem {
    title: string;
    desc: string;
    icon: LucideIcon;
    href: string;
    color: string;
}

interface CategoryConfig {
    features: FeatureItem[];
    groupHoverColor: string;
    hoverColor: string;
    newsLink: string;
    newsSubtitle: string;
}

export type CategoryKey = 'tesla' | 'desk' | 'ai' | 'baby' | 'pet';

const categoryConfigs: Record<CategoryKey, CategoryConfig> = {
    tesla: {
        features: [
            { title: '뉴스', desc: '테슬라 및 전기차 시장 뉴스를 확인하세요.', icon: Newspaper, href: '/tesla/news', color: 'text-purple-500' },
            { title: 'Shop', desc: '당신의 테슬라를 위한 추천 아이템.', icon: ShoppingBag, href: '/tesla/shop', color: 'text-tesla-red' },
            { title: '팁게시판', desc: '테슬라 오너들을 위한 유용한 꿀팁과 가이드를 확인하세요.', icon: Lightbulb, href: '/tesla/tips', color: 'text-yellow-500' },
            { title: '충전 & 보조금', desc: '슈퍼차저 위치와 전기차 보조금 현황을 확인하세요.', icon: Zap, href: '/tesla/info', color: 'text-blue-500' },
            { title: '룸', desc: '테슬라 오너들의 차에는 무엇이 있을까요? 사용자들의 꿀팁 확인하기.', icon: Warehouse, href: '/tesla/room', color: 'text-emerald-500' },
        ],
        groupHoverColor: 'group-hover:text-tesla-red',
        hoverColor: 'hover:text-tesla-red',
        newsLink: '/tesla/news',
        newsSubtitle: '테슬라와 전기차 시장의 가장 빠른 소식',
    },
    desk: {
        features: [
            { title: '뉴스', desc: '데스크 셋업, 가젯, 인테리어 관련 최신 트렌드를 확인하세요.', icon: Newspaper, href: '/desk/news', color: 'text-orange-500' },
            { title: '팁', desc: '생산성을 높이는 데스크 셋업 꿀팁과 인테리어 가이드.', icon: Lightbulb, href: '/desk/tips', color: 'text-amber-500' },
            { title: '샵', desc: '키보드, 모니터, 조명 등 데스크 필수템 모음.', icon: ShoppingBag, href: '/desk/shop', color: 'text-emerald-500' },
            { title: '룸', desc: '데스크 셋업을 공유하고 영감을 얻어보세요.', icon: Warehouse, href: '/desk/room', color: 'text-blue-500' },
        ],
        groupHoverColor: 'group-hover:text-orange-500',
        hoverColor: 'hover:text-orange-500',
        newsLink: '/desk/news',
        newsSubtitle: '데스크 셋업과 가젯의 가장 빠른 소식',
    },
    ai: {
        features: [
            { title: '뉴스', desc: 'AI 기술의 최신 동향과 뉴스를 실시간으로 확인하세요.', icon: Newspaper, href: '/ai/news', color: 'text-cyan-500' },
            { title: '팁', desc: 'ChatGPT, Claude, Gemini 등 AI 도구 활용 꿀팁과 프롬프트 공유.', icon: Lightbulb, href: '/ai/tips', color: 'text-purple-500' },
            { title: '샵', desc: 'AI 서비스 구독권, API 크레딧, AI 관련 도구 모음.', icon: ShoppingBag, href: '/ai/shop', color: 'text-emerald-500' },
            { title: '룸', desc: 'AI 개발자, 사용자들과 소통하며 정보를 나눠보세요.', icon: Warehouse, href: '/ai/room', color: 'text-blue-500' },
        ],
        groupHoverColor: 'group-hover:text-cyan-500',
        hoverColor: 'hover:text-cyan-500',
        newsLink: '/ai/news',
        newsSubtitle: 'AI 기술과 서비스의 가장 빠른 소식',
    },
    baby: {
        features: [
            { title: '뉴스', desc: '육아와 관련된 최신 뉴스와 정보를 확인하세요.', icon: Newspaper, href: '/baby/news', color: 'text-purple-500' },
            { title: '육아정보', desc: '아이를 키우는 데 꼭 필요한 꿀팁과 정보를 확인하세요.', icon: Lightbulb, href: '/baby/tips', color: 'text-pink-500' },
            { title: '육아 Shop', desc: '엄마 아빠가 인정한 최고의 육아 아이템.', icon: ShoppingBag, href: '/baby/shop', color: 'text-orange-500' },
            { title: '룸', desc: '육아 동지들과 소통하며 육아 스트레스를 날려버리세요.', icon: Warehouse, href: '/baby/room', color: 'text-blue-500' },
        ],
        groupHoverColor: 'group-hover:text-pink-500',
        hoverColor: 'hover:text-pink-500',
        newsLink: '/baby/news',
        newsSubtitle: '육아와 아이 관련 가장 빠른 소식',
    },
    pet: {
        features: [
            { title: '뉴스', desc: '반려동물 관련 최신 뉴스와 트렌드를 확인하세요.', icon: Newspaper, href: '/pet/news', color: 'text-amber-500' },
            { title: '팁', desc: '반려동물 건강, 훈련, 돌봄 꿀팁과 가이드.', icon: Lightbulb, href: '/pet/tips', color: 'text-lime-500' },
            { title: '샵', desc: '사료, 간식, 장난감 등 반려동물 필수템 모음.', icon: ShoppingBag, href: '/pet/shop', color: 'text-emerald-500' },
            { title: '룸', desc: '반려동물과의 일상을 공유하고 소통해보세요.', icon: Warehouse, href: '/pet/room', color: 'text-blue-500' },
        ],
        groupHoverColor: 'group-hover:text-amber-500',
        hoverColor: 'hover:text-amber-500',
        newsLink: '/pet/news',
        newsSubtitle: '반려동물과 펫 케어의 가장 빠른 소식',
    },
};

interface CategoryHomeProps {
    category: CategoryKey;
    newsData: NewsItem[];
}

const FALLBACK_IMG = '/room-icon/zroom_icon.webp';

function Thumbnail({ src, alt }: { src: string | null; alt: string }) {
    const [failed, setFailed] = useState(false);
    const onError = useCallback(() => setFailed(true), []);

    return (
        <img
            src={src && !failed ? src : FALLBACK_IMG}
            alt={alt}
            onError={onError}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${src && !failed ? 'object-cover' : 'object-contain p-6'}`}
        />
    );
}

export default function CategoryHome({ category, newsData }: CategoryHomeProps) {
    const { features, groupHoverColor, hoverColor, newsLink, newsSubtitle } = categoryConfigs[category];

    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b -z-10" />
            <section className="py-5 bg-foreground/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-4 rounded-2xl group transition-all shadow-lg"
                            >
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><feature.icon className={`h-6 w-6 ${feature.color}`} />{feature.title}</h3>
                                <p className="text-sm text-foreground/60 leading-relaxed mb-6">
                                    {feature.desc}
                                </p>
                                <Link
                                    href={feature.href}
                                    className={`text-sm font-bold flex items-center gap-1 ${groupHoverColor} transition-colors`}
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
                        <p className="text-foreground/60">{newsSubtitle}</p>
                    </div>
                    <Link href={newsLink} className={`text-sm font-bold ${hoverColor} transition-colors`}>전체보기</Link>
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
                                    <Thumbnail src={item.thumbnail} alt={item.title} />
                                </div>
                                <div className="flex flex-col justify-center flex-grow">
                                    <h3 className={`font-bold text-xl leading-tight mb-2 ${groupHoverColor} transition-colors line-clamp-2`}>
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
