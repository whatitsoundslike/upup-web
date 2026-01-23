'use client';

import { motion } from 'framer-motion';
import { Star, Tag, Heart } from 'lucide-react';
import Link from 'next/link';

const listings = [
    { id: 1, name: '2022 테슬라 모델 3 롱레인지', price: '48,000,000', category: 'Vehicle', rating: 4.9, location: '서울' },
    { id: 2, name: '2021 테슬라 모델 Y 퍼포먼스', price: '56,500,000', category: 'Vehicle', rating: 4.8, location: '경기' },
    { id: 3, name: '모델 3 리프레시 18인치 휠/타이어세트', price: '850,000', category: 'Parts', rating: 5.0, location: '인천' },
    { id: 4, name: '2023 테슬라 모델 X 플래드', price: '125,000,000', category: 'Vehicle', rating: 4.7, location: '부산' },
    { id: 5, name: '월 커넥터 (3세대) 미개봉', price: '450,000', category: 'Charging', rating: 4.9, location: '대구' },
    { id: 6, name: '모델 Y Jeda 무선 충전 패드', price: '80,000', category: 'Accessory', rating: 4.6, location: '광주' },
];

export default function UsedTradePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Used Market</h1>
                    <p className="text-foreground/60 text-lg">테슬라 오너들간의 믿을 수 있는 중고 거래.</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'Vehicle', 'Parts', 'Charging', 'Accessory'].map((tab) => (
                        <button key={tab} className="px-4 py-2 rounded-full border dark:border-white/10 text-sm font-bold hover:bg-foreground/5 transition-all">
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                {listings.map((item, idx) => (
                    <Link key={item.id} href={`/tesla/room/${item.id}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group cursor-pointer p-2 rounded-[1rem] border border-foreground/5 hover:bg-foreground/5 transition-all flex flex-col h-full"
                        >
                            <div className="aspect-square bg-foreground/5 rounded-2xl overflow-hidden mb-6 relative">
                                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                                    <button className="bg-white/10 glass rounded-full">
                                        <Heart className="h-5 w-5" />
                                    </button>
                                </div>
                                {idx < 2 && (
                                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-tesla-red text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                        Hot
                                    </div>
                                )}
                                <div className="w-full h-full flex items-center justify-center italic text-foreground/20 font-bold text-xl uppercase tracking-tighter">
                                    {item.category === 'Vehicle' ? 'Car Image' : 'Item Image'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{item.category} • {item.location}</span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                        <Star className="h-3 w-3 fill-amber-500" /> {item.rating}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold group-hover:text-tesla-red transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black">{item.price}원</span>
                                    <Tag className="h-4 w-4 text-tesla-red" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
