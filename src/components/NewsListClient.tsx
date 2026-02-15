'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { NewsItem, NewsCategory } from './newsData';

interface NewsListClientProps {
    news: NewsItem[];
    category: NewsCategory;
}

const categoryConfigs: Record<NewsCategory, {
    title: string;
    description: string;
    accentColor: string;
    badgeColor: string;
    defaultThumbnail: string | null;
    emoji: string;
}> = {
    tesla: {
        title: 'Latest News',
        description: '테슬라와 전기차 시장의 가장 생생한 소식을 전해드립니다.',
        accentColor: 'group-hover:text-tesla-red',
        badgeColor: 'text-tesla-red bg-tesla-red/10',
        defaultThumbnail: '/tesla_thumbnail.webp',
        emoji: '🚗',
    },
    baby: {
        title: 'Baby News',
        description: '육아와 아이 관련 최신 뉴스와 정보를 전해드립니다.',
        accentColor: 'group-hover:text-pink-500',
        badgeColor: 'text-pink-500 bg-pink-500/10',
        defaultThumbnail: null,
        emoji: '👶',
    },
    ai: {
        title: 'AI News',
        description: 'AI 기술과 서비스의 최신 소식을 전해드립니다.',
        accentColor: 'group-hover:text-cyan-500',
        badgeColor: 'text-cyan-500 bg-cyan-500/10',
        defaultThumbnail: null,
        emoji: '🤖',
    },
    desk: {
        title: '데스크 뉴스',
        description: '데스크 셋업과 관련된 최신 뉴스와 트렌드를 전해드립니다.',
        accentColor: 'group-hover:text-orange-500',
        badgeColor: 'text-orange-500 bg-orange-500/10',
        defaultThumbnail: null,
        emoji: '🖥️',
    },
    pet: {
        title: 'Pet News',
        description: '반려동물과 펫 케어 관련 최신 뉴스와 정보를 전해드립니다.',
        accentColor: 'group-hover:text-amber-500',
        badgeColor: 'text-amber-500 bg-amber-500/10',
        defaultThumbnail: null,
        emoji: '🐾',
    },
};

const FALLBACK_IMG = '/room-icon/zroom_icon.webp';

function NewsThumbnail({ src, alt }: { src: string | null; alt: string }) {
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

export default function NewsListClient({ news, category }: NewsListClientProps) {
    const config = categoryConfigs[category];

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">{config.title}</h1>
                <p className="text-foreground/60 text-lg">{config.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {news.map((item, idx) => (
                        <Link href={item.link} key={idx} target="_blank" rel="noopener noreferrer">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer border border-transparent hover:border-foreground/10"
                            >
                                <div className="w-full md:w-48 h-48 md:h-32 flex-shrink-0 bg-foreground/5 rounded-xl overflow-hidden relative">
                                    <NewsThumbnail
                                        src={item.thumbnail}
                                        alt={item.title}
                                    />
                                </div>

                                <div className="flex flex-col justify-center flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${config.badgeColor}`}>
                                            {item.source}
                                        </span>
                                        {item.published_at && (
                                            <span className="text-xs text-foreground/40 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {item.published_at.split('T')[0]}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={`font-bold text-xl leading-tight mb-2 transition-colors line-clamp-2 ${config.accentColor}`}>
                                        {item.title}
                                    </h3>

                                    {item.description && (
                                        <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className={`flex items-center text-xs font-semibold text-foreground/40 transition-colors mt-auto ${config.accentColor}`}>
                                        기사 원문 보기 <ExternalLink className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}

                    {news.length === 0 && (
                        <div className="text-center py-20 text-foreground/40 font-medium">
                            등록된 뉴스 기사가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
