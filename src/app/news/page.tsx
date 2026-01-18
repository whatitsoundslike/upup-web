'use client';

import { motion } from 'framer-motion';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const newsItems = [
    {
        id: 1,
        title: '테슬라, 2026년형 모델 3 "하이랜더" 국내 출시 확정',
        summary: '더욱 길어진 주행 거리와 개선된 승차감으로 돌아온 모델 3 하이랜더의 국내 출시 일정이 공개되었습니다.',
        date: '2026.01.19',
        category: '신차 소식',
        image: 'Tesla News 1'
    },
    {
        id: 2,
        title: 'V4 슈퍼차저 스테이션 전국 확대 설치 계획 발표',
        summary: '테슬라 코리아는 올해 말까지 전국 20개 주요 거점에 V4 슈퍼차저를 추가 배치할 예정입니다.',
        date: '2026.01.18',
        category: '인프라',
        image: 'Tesla News 2'
    },
    {
        id: 3,
        title: 'FSD V13 업데이트: 국내 도로 환경 최적화 진행 중',
        summary: '북미에서 호평받은 FSD V13의 국내 도입을 위한 테스트 데이터 수집이 가속화되고 있습니다.',
        date: '2026.01.15',
        category: '소프트웨어',
        image: 'Tesla News 3'
    }
];

export default function NewsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Latest News</h1>
                <p className="text-foreground/60 text-lg">테슬라와 전기차 시장의 가장 생생한 소식을 전해드립니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Featured News */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group cursor-pointer overflow-hidden rounded-3xl active:scale-[0.98] transition-transform"
                >
                    <div className="aspect-[16/10] bg-foreground/5 flex items-center justify-center text-foreground/20 italic">
                        Featured News Image
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
                        <span className="inline-block px-3 py-1 bg-tesla-red text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 w-fit">
                            Top Story
                        </span>
                        <h2 className="text-3xl font-bold mb-4 group-hover:underline">사이버트럭 국내 공식 인도 시작, 첫 번째 주인공은?</h2>
                        <p className="text-white/70 line-clamp-2 mb-6">오랜 기다림 끝에 사이버트럭의 국내 인도 행사가 평택 항만에서 개최되었습니다.</p>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <Calendar className="h-4 w-4" /> 2026.01.19
                        </div>
                    </div>
                </motion.div>

                {/* News List */}
                <div className="flex flex-col gap-6">
                    {newsItems.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-6 p-4 rounded-2xl hover:bg-foreground/5 transition-colors group cursor-pointer"
                        >
                            <div className="w-32 h-24 flex-shrink-0 bg-foreground/5 rounded-xl flex items-center justify-center text-[10px] text-foreground/20 uppercase italic font-bold">
                                Image
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-xs font-bold text-tesla-red mb-1 uppercase tracking-wider">{item.category}</span>
                                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-tesla-red transition-colors line-clamp-1">{item.title}</h3>
                                <p className="text-sm text-foreground/60 line-clamp-1 mb-2">{item.summary}</p>
                                <span className="text-xs text-foreground/40 font-medium">{item.date}</span>
                            </div>
                        </motion.div>
                    ))}
                    <button className="w-full py-4 mt-2 border-2 border-foreground/10 rounded-xl font-bold hover:bg-foreground/5 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                        Load More News <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
