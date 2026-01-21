'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Share2, MapPin, Calendar, Gauge, MessageCircle, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Dummy data fetching - in a real app this would use the ID from params
const listings = [
    { id: 1, name: '2022 테슬라 모델 3 롱레인지', price: '48,000,000', category: 'Vehicle', rating: 4.9, location: '서울 강남구', mileage: '24,000km', year: '2022년 3월', description: '무사고, 비흡연 차량입니다. 오토파일럿 탑재되어 있으며 유리막 코팅 및 틴팅 완료된 상태입니다. 배터리 상태 매우 양호합니다.' },
    { id: 2, name: '2021 테슬라 모델 Y 퍼포먼스', price: '56,500,000', category: 'Vehicle', rating: 4.8, location: '경기 성남시', mileage: '38,000km', year: '2021년 8월', description: '퍼포먼스 모델답게 압도적인 가속력을 자랑합니다. 트랙 모드 사용 기록 없으며 깔끔하게 관리했습니다.' },
];

export default function UsedTradeDetailPage({ params }: { params: { id: string } }) {
    // Find listing based on ID (fallback to first listing for demo)
    const item = listings.find(p => p.id === parseInt(params.id)) || listings[0];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 lg:sticky lg:top-32"
                >
                    <div className="aspect-[4/3] bg-foreground/5 rounded-3xl overflow-hidden relative group">
                        <div className="w-full h-full flex items-center justify-center italic text-foreground/10 font-black text-4xl uppercase tracking-widest select-none">
                            {item.category === 'Vehicle' ? 'Vehicle Photo' : 'Item Photo'}
                        </div>
                        <div className="absolute top-6 left-6">
                            <span className="px-4 py-2 bg-tesla-red text-white text-xs font-black rounded-full uppercase tracking-widest">
                                Certified
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-foreground/5 rounded-xl border border-foreground/5" />
                        ))}
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col h-full"
                >
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-xs">{item.category}</span>
                                <span className="w-1 h-1 bg-foreground/20 rounded-full" />
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 uppercase">
                                    <Star className="h-3 w-3 fill-amber-500" /> {item.rating} Rating
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-tight">
                                {item.name}
                            </h1>
                            <div className="text-4xl font-black text-tesla-red">
                                {item.price} <span className="text-xl">원</span>
                            </div>
                        </div>

                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center gap-4">
                                <MapPin className="h-6 w-6 text-foreground/40" />
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Location</p>
                                    <p className="font-bold">{item.location}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center gap-4">
                                <Calendar className="h-6 w-6 text-foreground/40" />
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Year</p>
                                    <p className="font-bold">{item.year}</p>
                                </div>
                            </div>
                            {item.mileage && (
                                <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center gap-4">
                                    <Gauge className="h-6 w-6 text-foreground/40" />
                                    <div>
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase">Mileage</p>
                                        <p className="font-bold">{item.mileage}</p>
                                    </div>
                                </div>
                            )}
                            <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex items-center gap-4">
                                <ShieldCheck className="h-6 w-6 text-foreground/40" />
                                <div>
                                    <p className="text-[10px] font-bold text-foreground/40 uppercase">Status</p>
                                    <p className="font-bold text-emerald-500">Available</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-black uppercase tracking-widest text-sm">Description</h3>
                            <p className="text-foreground/60 leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        <div className="h-px bg-foreground/5 w-full mt-8" />

                        {/* Seller Card */}
                        <div className="p-6 rounded-3xl border dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-foreground/5 flex items-center justify-center">
                                    <User className="h-8 w-8 text-foreground/20" />
                                </div>
                                <div>
                                    <p className="font-black text-lg">테슬라매니아</p>
                                    <p className="text-xs text-foreground/40 font-medium">거래 42회 • 만족도 98%</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
                                    <Heart className="h-5 w-5" />
                                </button>
                                <button className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex gap-4">
                            <button className="flex-[2] bg-foreground text-background py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-tesla-red hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
                                <MessageCircle className="h-6 w-6" />
                                Chat with Seller
                            </button>
                            <button className="flex-1 border-2 border-foreground py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-foreground/5 transition-all">
                                Safety Guide
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
