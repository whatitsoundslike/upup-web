'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { TipItem } from './tipData';

export type TipsTheme = 'tesla' | 'baby' | 'ai' | 'desk' | 'pet';

interface ThemeConfig {
    title: string;
    description: string;
    accentColor: string;
    basePath: string;
}

const themeConfigs: Record<TipsTheme, ThemeConfig> = {
    tesla: {
        title: 'Tesla Tips',
        description: '테슬라 오너들을 위한 유용한 꿀팁과 가이드를 공유합니다.',
        accentColor: 'group-hover:text-tesla-red',
        basePath: '/tesla/tips',
    },
    baby: {
        title: 'Baby Tips',
        description: '육아 꿀팁과 필수 정보를 공유합니다.',
        accentColor: 'group-hover:text-pink-500',
        basePath: '/baby/tips',
    },
    ai: {
        title: 'AI Tips',
        description: 'ChatGPT, Claude, Gemini 등 AI 도구 활용 꿀팁과 프롬프트를 공유합니다.',
        accentColor: 'group-hover:text-cyan-500',
        basePath: '/ai/tips',
    },
    desk: {
        title: 'Desk Tips',
        description: '생산성을 높이는 데스크 셋업 꿀팁과 인테리어 가이드를 공유합니다.',
        accentColor: 'group-hover:text-orange-500',
        basePath: '/desk/tips',
    },
    pet: {
        title: 'Pet Tips',
        description: '반려동물 건강, 훈련, 돌봄 꿀팁과 가이드를 공유합니다.',
        accentColor: 'group-hover:text-amber-500',
        basePath: '/pet/tips',
    },
};

interface Props {
    tips: TipItem[];
    theme: TipsTheme;
}

const FALLBACK_IMG = '/room-icon/zroom_icon.webp';

function TipThumbnail({ src, alt }: { src: string | null; alt: string }) {
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

export default function TipsList({ tips, theme }: Props) {
    const config = themeConfigs[theme];

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-4xl font-black tracking-tighter uppercase">{config.title}</h1>
                </div>
                <p className="text-foreground/60 text-lg">{config.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tips.map((tip, idx) => (
                    <Link
                        key={tip.id}
                        href={`${config.basePath}/${tip.id}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass group rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all h-full cursor-pointer"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <TipThumbnail src={tip.thumbnail} alt={tip.title} />
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className={`text-xl font-bold mb-3 transition-colors line-clamp-1 ${config.accentColor}`}>
                                    {tip.title}
                                </h3>
                                <p className="text-sm text-foreground/60 line-clamp-3 mb-6 flex-grow">
                                    {tip.summary}
                                </p>

                                <div className={`text-sm font-bold flex items-center gap-1 text-foreground/40 transition-all mt-auto self-start ${config.accentColor}`}>
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
