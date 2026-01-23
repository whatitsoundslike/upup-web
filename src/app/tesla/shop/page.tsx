'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Star, TrendingUp, Tag, Heart } from 'lucide-react';
import Link from 'next/link';
import products from './cp_products.json';

export default function ShopPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Accessory Store</h1>
                    <p className="text-foreground/60 text-lg">당신의 테슬라를 더욱 특별하게 만드는 최고의 선택.</p>
                </div>
                {/* <div className="flex gap-2">
                    {['All', 'Interior', 'Exterior', 'Tech'].map((tab) => (
                        <button key={tab} className="px-4 py-2 rounded-full border dark:border-white/10 text-sm font-bold hover:bg-foreground/5 transition-all">
                            {tab}
                        </button>
                    ))}
                </div> */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                {products.map((product, idx) => (
                    <Link href={product.link} target='_blank' key={product.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group cursor-pointer rounded-[1rem] border border-foreground/5 hover:bg-foreground/5 transition-all flex flex-col h-full"
                        >
                            <div className="aspect-square bg-foreground/5 rounded-t-[1rem] overflow-hidden mb-6 relative">
                                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                                    <button className="bg-white/10 glass rounded-full">
                                        <Heart fill="white" className="h-5 w-5" />
                                    </button>
                                </div>
                                {idx === 0 && (
                                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-tesla-red text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                                        Best
                                    </div>
                                )}
                                {product.thumb ? (
                                    <img
                                        src={product.thumb}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center italic text-foreground/20 font-bold text-xl uppercase tracking-tighter">
                                        Product Image
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 px-2 pb-2">
                                <h3 className="text-lg font-bold group-hover:text-tesla-red transition-colors">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black">{product.price}원</span>
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
