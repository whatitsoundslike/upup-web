'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Star, TrendingUp, Tag, Heart } from 'lucide-react';

const products = [
    { id: 1, name: '사이버트럭 스타일 무선 충전기', price: '129,000', category: 'Interior', rating: 4.9 },
    { id: 2, name: '모델 3/Y 일체형 매트 세트', price: '185,000', category: 'Protection', rating: 4.8 },
    { id: 3, name: '슈퍼차저 스타일 데스크 가젯', price: '45,000', category: 'Lifestyle', rating: 5.0 },
    { id: 4, name: '카본 파이버 스포일러', price: '320,000', category: 'Performance', rating: 4.7 },
    { id: 5, name: '알칸타라 키 카드 케이스', price: '29,000', category: 'Lifestyle', rating: 4.9 },
    { id: 6, name: 'HEPA 에어필터 (V2)', price: '68,000', category: 'Maintenance', rating: 4.6 },
];

export default function ShopPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Accessory Store</h1>
                    <p className="text-foreground/60 text-lg">당신의 테슬라를 더욱 특별하게 만드는 최고의 선택.</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'Interior', 'Exterior', 'Tech'].map((tab) => (
                        <button key={tab} className="px-4 py-2 rounded-full border dark:border-white/10 text-sm font-bold hover:bg-foreground/5 transition-all">
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group cursor-pointer p-2 rounded-[1rem] border border-foreground/5 hover:bg-foreground/5 transition-all flex flex-col"
                    >
                        <div className="aspect-square bg-foreground/5 rounded-2xl overflow-hidden mb-6 relative">
                            <div className="absolute top-4 right-4 z-10">
                                <button className="bg-white/10 glass rounded-full">
                                    <Heart className="h-5 w-5" />
                                </button>
                            </div>
                            {idx === 0 && (
                                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-tesla-red text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                    Best
                                </div>
                            )}
                            <div className="w-full h-full flex items-center justify-center italic text-foreground/20 font-bold text-xl uppercase tracking-tighter">
                                Product Image
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{product.category}</span>
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                    <Star className="h-3 w-3 fill-amber-500" /> {product.rating}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold group-hover:text-tesla-red transition-colors">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black">{product.price}원</span>
                                <Tag className="h-4 w-4 text-tesla-red" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
