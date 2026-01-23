'use client';

import { motion } from 'framer-motion';
import { Newspaper, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import newsData from './news.json';

interface NewsItem {
    source: string;
    title: string;
    link: string;
    thumbnail: string | null;
    description: string;
    published_at: string | null;
}

export default function NewsPage() {
    // Filter out template items if any exist (checking for {{title}})
    const validNews = (newsData as NewsItem[]).filter(item => !item.title.includes('{{title}}'));

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Latest News</h1>
                <p className="text-foreground/60 text-lg">테슬라와 전기차 시장의 가장 생생한 소식을 전해드립니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* News List */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {validNews.map((item, idx) => (
                        <Link href={item.link} key={idx} target="_blank" rel="noopener noreferrer">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer border border-transparent hover:border-foreground/10"
                            >
                                {/* Thumbnail */}
                                <div className="w-full md:w-48 h-48 md:h-32 flex-shrink-0 bg-foreground/5 rounded-xl overflow-hidden relative">
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
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50"
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-center flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-tesla-red uppercase tracking-wider bg-tesla-red/10 px-2 py-1 rounded-full">
                                            {item.source}
                                        </span>
                                        {item.published_at && (
                                            <span className="text-xs text-foreground/40 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {item.published_at.split('T')[0]}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-xl leading-tight mb-2 group-hover:text-tesla-red transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center text-xs font-semibold text-foreground/40 group-hover:text-tesla-red transition-colors mt-auto">
                                        기사 원문 보기 <ExternalLink className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}

                    {validNews.length === 0 && (
                        <div className="text-center py-20 text-foreground/40">
                            뉴스 데이터를 불러올 수 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
