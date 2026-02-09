'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type { TipItem } from './tipData';
import type { TipsTheme } from './TipsList';
import '@/styles/tipDetail.css';

interface ThemeConfig {
    accentColor: string;
    basePath: string;
}

const themeConfigs: Record<TipsTheme, ThemeConfig> = {
    tesla: {
        accentColor: 'text-tesla-red',
        basePath: '/tesla/tips',
    },
    baby: {
        accentColor: 'text-pink-500',
        basePath: '/baby/tips',
    },
    ai: {
        accentColor: 'text-cyan-500',
        basePath: '/ai/tips',
    },
};

interface Props {
    tip: TipItem;
    relatedTips: TipItem[];
    theme: TipsTheme;
}

export default function TipDetail({ tip, relatedTips, theme }: Props) {
    const config = themeConfigs[theme];

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
            {/* Hero Section with Image */}
            <div className="relative h-[40vh] overflow-hidden">
                {tip.thumbnail ? (
                    <img
                        src={tip.thumbnail}
                        alt={tip.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                        <Lightbulb className="w-24 h-24 text-foreground/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative max-w-4xl mx-auto px-4 mt-[-40px] pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-zinc-200 dark:border-zinc-800"
                >
                    {/* Back Button */}
                    <Link
                        href={config.basePath}
                        className={`inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:${config.accentColor} transition-colors mb-6 group`}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        목록으로 돌아가기
                    </Link>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-zinc-900 dark:text-white leading-snug">
                        {tip.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: tip.title,
                                        text: tip.summary ?? undefined,
                                        url: window.location.href,
                                    });
                                }
                            }}
                            className={`flex items-center gap-2 hover:${config.accentColor} transition-colors ml-auto`}
                        >
                            <Share2 className="w-4 h-4" />
                            <span>공유하기</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        className="tip-content prose prose-lg max-w-none prose-zinc dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-strong:text-zinc-900 dark:prose-strong:text-white prose-blockquote:border-tesla-red"
                        dangerouslySetInnerHTML={{ __html: tip.content }}
                    />
                </motion.div>

                {/* Related Tips */}
                {relatedTips.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">다른 팁</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {relatedTips.map((relatedTip) => (
                                <Link
                                    key={relatedTip.id}
                                    href={`${config.basePath}/${relatedTip.id}`}
                                    className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden group hover:shadow-xl transition-all border border-zinc-200 dark:border-zinc-800"
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        {relatedTip.thumbnail ? (
                                            <img
                                                src={relatedTip.thumbnail}
                                                alt={relatedTip.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                                                <Lightbulb className="w-12 h-12 text-foreground/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className={`font-bold mb-2 text-zinc-900 dark:text-white group-hover:${config.accentColor} transition-colors line-clamp-2`}>
                                            {relatedTip.title}
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {relatedTip.summary}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
