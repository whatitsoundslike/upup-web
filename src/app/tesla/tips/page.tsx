'use client';

import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, Zap, Battery, Shield, Settings } from 'lucide-react';

const tipCategories = [
    { title: '배터리 관리', icon: Battery, color: 'text-emerald-500' },
    { title: '충전 팁', icon: Zap, color: 'text-amber-500' },
    { title: '안전 가이드', icon: Shield, color: 'text-blue-500' },
    { title: '최적 설정', icon: Settings, color: 'text-purple-500' },
];

const mustReadTips = [
    { id: 1, title: '배터리 열화 방지를 위한 20-80 법칙', desc: '항상 100% 충전하는 것이 좋은 건 아닙니다. 수명을 늘리는 골든 라인은...' },
    { id: 2, title: '사고 시 비상 탈출 레버 위치 (전 모델)', author: '테슬라 코리아 정식 가이드 기반' },
    { id: 3, title: '윈터 모드 활성화로 전비 20% 아끼기', author: '강원도 오너들의 실전 팁' },
];

export default function TipsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Ownership Tips</h1>
                <p className="text-foreground/60 text-lg">테슬라와 함께하는 스마트한 라이프를 위한 모든 노하우.</p>
            </div>

            {/* Quick Search Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {tipCategories.map((cat) => (
                    <motion.button
                        key={cat.title}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-8 glass rounded-3xl flex flex-col items-center gap-4 hover:border-tesla-red transition-all group"
                    >
                        <cat.icon className={`h-8 w-8 ${cat.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-bold">{cat.title}</span>
                    </motion.button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Must Read Section */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <Lightbulb className="h-6 w-6 text-tesla-red" />
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Essential Guides</h2>
                    </div>
                    <div className="space-y-6">
                        {mustReadTips.map((tip) => (
                            <div key={tip.id} className="p-8 glass rounded-3xl border-l-4 border-tesla-red relative overflow-hidden group hover:bg-foreground/5 transition-all cursor-pointer">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <CheckCircle2 className="h-20 w-20" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                                <p className="text-sm text-foreground/60 leading-relaxed">
                                    {tip.desc || '테슬라 매뉴얼에는 없는 실전 노하우를 확인해보세요.'}
                                </p>
                                <button className="mt-6 text-sm font-bold text-tesla-red flex items-center gap-1">
                                    전체 가이드 보기
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Tips Sneak Peak */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <Zap className="h-6 w-6 text-tesla-red" />
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Watch & Learn</h2>
                    </div>
                    <div className="aspect-video bg-foreground/5 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center pl-1">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-black border-b-[10px] border-b-transparent" />
                            </div>
                        </div>
                        <div className="font-bold text-foreground/20 italic text-xl uppercase tracking-tighter">
                            Manual Video Placeholder
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        <h4 className="font-bold text-lg">초보 오너를 위한 10분 마스터 클래스</h4>
                        <div className="flex gap-4">
                            {['#슈퍼차징', '#원피달드라이빙', '#오토파일럿'].map(tag => (
                                <span key={tag} className="text-xs font-bold text-foreground/40">{tag}</span>
                            ))}
                        </div>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                            테슬라를 처음 구매하셨나요? 가장 기본적인 충전 방법부터 오토파일럿 활용법까지 영상 하나로 끝내보세요.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
