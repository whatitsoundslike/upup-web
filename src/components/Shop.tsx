'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
    price: string;
    link: string;
    thumbnail: string | null;
}

// 4시간 단위 버전 값 생성
export function get4HourVersion(date = new Date()) {
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    return Math.floor(date.getTime() / FOUR_HOURS);
}

interface ShopPageProps {
    category: 'tesla' | 'toy';
}

export default function Shop({ category }: ShopPageProps) {
    const categoryTitles = {
        tesla: {
            title: 'Tesla Accessory Store',
            subtitle: '당신의 테슬라를 더욱 특별하게 만드는 최고의 선택.',
        },
        toy: {
            title: 'Toy Shop',
            subtitle: '최고의 장난감을 만나보세요.',
        },
    };

    const config = categoryTitles[category];

    const [products, setProducts] = useState<Product[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        useEffect(() => {
                const fetchNews = async () => {
                    
                    try {
                        const response = await fetch('https://cdn.jsdelivr.net/gh/grapheople/jroom@main/json/tesla_products.json?v=' + get4HourVersion());
                        const data = await response.json();
                        setProducts(data);
                    } catch (error) {
                        console.error('Failed to fetch news:', error);
                    } finally {
                        setIsLoading(false);
                    }
                };
        
                fetchNews();
            }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">{config.title}</h1>
                    <p className="text-foreground/60 text-lg">{config.subtitle}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
                {products.map((product, idx) => (
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
                                <h3 className="text-lg font-bold group-hover:text-tesla-red transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black">{product.price}원</span>
                                    <Tag className="h-4 w-4 text-tesla-red" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
            <a className="flex mt-12 justify-center"
                href="https://link.coupang.com/a/dAkm6t"
                target="_blank"
                referrerPolicy="unsafe-url"
            >
                <img
                    src="https://ads-partners.coupang.com/banners/960739?subId=zroomzroom&traceId=V0-301-5079b8362432a905-I960739&w=728&h=90"
                    alt=""
                />
            </a>
        </div>
    );
}
