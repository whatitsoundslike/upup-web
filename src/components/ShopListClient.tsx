'use client';

import { motion } from 'framer-motion';
import { Tag, Heart, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export interface Product {
    id: string;
    name: string;
    price: string;
    link: string;
    thumbnail: string | null;
}

export type ShopCategory = 'tesla' | 'baby' | 'ai' | 'desk';

interface ShopListClientProps {
    products: Product[];
    category: ShopCategory;
}

const categoryConfigs: Record<ShopCategory, { title: string; subtitle: string; accentColor: string }> = {
    tesla: {
        title: 'Tesla Accessory Store',
        subtitle: '당신의 테슬라를 더욱 특별하게 만드는 최고의 선택.',
        accentColor: 'group-hover:text-tesla-red',
    },
    baby: {
        title: 'Baby Shop',
        subtitle: '우리 아이를 위한 최고의 육아용품을 만나보세요.',
        accentColor: 'group-hover:text-pink-500',
    },
    ai: {
        title: 'AI Shop',
        subtitle: 'AI기술과 함께 활용할 제품들을 만나보세요.',
        accentColor: 'group-hover:text-cyan-500',
    },
    desk: {
        title: 'Desk Shop',
        subtitle: '데스크테리어를 위한 최고의 선택.',
        accentColor: 'group-hover:text-orange-500',
    },
};

export default function ShopListClient({ products, category }: ShopListClientProps) {
    const config = categoryConfigs[category];
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = searchQuery
        ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : products;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">{config.title}</h1>
                    <p className="text-foreground/60 text-lg">{config.subtitle}</p>
                </div>
            </div>
            <div className="relative w-full md:w-105 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                    type="text"
                    placeholder="제품명 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-sm focus:outline-none focus:border-tesla-red transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                {filteredProducts.map((product, idx) => (
                    <Link href={product.link} target="_blank" key={product.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group cursor-pointer rounded-[1rem] border border-foreground/5 hover:bg-foreground/5 transition-all flex flex-col h-full"
                        >
                            <div className="aspect-square bg-foreground/5 rounded-t-[1rem] overflow-hidden mb-6 relative">
                                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                                    <button className="bg-white/10 glass rounded-full p-2">
                                        <Heart className="h-5 w-5" />
                                    </button>
                                </div>
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
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
                                <h3 className={`text-lg font-bold transition-colors line-clamp-2 ${config.accentColor}`}>
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black">{product.price}</span>
                                    <Tag className="h-4 w-4 text-tesla-red" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
            <a className="flex mt-12 justify-center"
                href="https://link.coupang.com/a/dJNasn"
                target="_blank"
                referrerPolicy="unsafe-url"
            >
                <img
                    src="https://ads-partners.coupang.com/banners/964332?subId=&traceId=V0-301-879dd1202e5c73b2-I964332&w=728&h=90"
                    alt=""
                />
            </a>
        </div>
    );
}
