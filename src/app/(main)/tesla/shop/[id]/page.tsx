'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, Minus, Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

// Dummy data fetching - in a real app this would use the ID from params
const products = [
    { id: 1, name: '사이버트럭 스타일 무선 충전기', price: '129,000', category: 'Interior', rating: 4.9, reviews: 128, description: '테슬라 사이버트럭의 강인한 디자인을 계승한 프리미엄 무선 충전기입니다. 15W 고속 충전을 지원하며, 알루미늄 합금 바디로 탁월한 내구성을 자랑합니다.' },
    { id: 2, name: '모델 3/Y 일체형 매트 세트', price: '185,000', category: 'Protection', rating: 4.8, reviews: 245, description: '완벽한 핏을 제공하는 친환경 TPE 소재의 일체형 매트 세트입니다. 오염에 강하며 물세척만으로 간편하게 관리할 수 있습니다.' },
    { id: 3, name: '슈퍼차저 스타일 데스크 가젯', price: '45,000', category: 'Lifestyle', rating: 5.0, reviews: 89, description: '테슬라 슈퍼차저를 1:12 비율로 정교하게 재현한 데스크탑 USB 허브입니다. 오피스 공간에 테슬라 감성을 더해보세요.' },
];

export default function ShopDetailPage({ params }: { params: { id: string } }) {
    const [quantity, setQuantity] = React.useState(1);
    // Find product based on ID (fallback to first product for demo)
    const product = products.find(p => p.id === parseInt(params.id)) || products[0];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Image Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <div className="aspect-square bg-foreground/5 rounded-3xl overflow-hidden relative group">
                        <div className="w-full h-full flex items-center justify-center italic text-foreground/10 font-black text-4xl uppercase tracking-widest select-none">
                            Premium Product Image
                        </div>
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <button className="p-3 bg-white dark:bg-black/50 backdrop-blur-md rounded-full border border-dark:white/10 hover:scale-110 transition-transform shadow-xl">
                                <Heart className="h-6 w-6" />
                            </button>
                            <button className="p-3 bg-white dark:bg-black/50 backdrop-blur-md rounded-full border border-dark:white/10 hover:scale-110 transition-transform shadow-xl">
                                <Share2 className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-tesla-red font-bold uppercase tracking-[0.2em] text-sm">{product.category}</span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-amber-500' : 'text-foreground/10'}`} />
                                ))}
                                <span className="ml-2 text-foreground font-bold">{product.rating}</span>
                            </div>
                            <span className="text-foreground/40 text-sm font-medium">{product.reviews} Reviews</span>
                        </div>

                        <div className="text-4xl font-black">
                            {product.price} <span className="text-xl">원</span>
                        </div>

                        <p className="text-foreground/60 text-lg leading-relaxed max-w-xl">
                            {product.description}
                        </p>

                        <div className="h-px bg-foreground/5 w-full my-8" />

                        {/* Quantity & Actions */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-8">
                                <span className="font-bold uppercase tracking-widest text-xs">Quantity</span>
                                <div className="flex items-center border dark:border-white/10 rounded-full px-2 py-1 bg-foreground/5">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:text-tesla-red transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-bold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 hover:text-tesla-red transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex-1 bg-foreground text-background py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-tesla-red hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl">
                                    Buy Now
                                </button>
                                <button className="flex-1 border-2 border-foreground py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-foreground/5 transition-all flex items-center justify-center gap-3">
                                    <ShoppingCart className="h-6 w-6" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
                            {[
                                { icon: ShieldCheck, title: 'Quality Guarantee', desc: '100% 테슬라 전용 설계' },
                                { icon: Truck, title: 'Fast Shipping', desc: '전국 무료 배송 서비스' },
                                { icon: RotateCcw, title: 'Easy Returns', desc: '14일 이내 무료 반품' },
                            ].map((feature, i) => (
                                <div key={i} className="space-y-2">
                                    <feature.icon className="h-6 w-6 text-tesla-red" />
                                    <h4 className="font-bold text-sm uppercase tracking-wider">{feature.title}</h4>
                                    <p className="text-xs text-foreground/40">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
