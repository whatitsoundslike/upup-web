'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface RoomPageProps {
    category: 'tesla' | 'baby';
}

export default function Room({ category }: RoomPageProps) {
    const categoryConfig = {
        tesla: {
            title: 'Tesla Community Room',
            subtitle: '테슬라 오너들과 함께 소통하고 정보를 나누세요.',
            rooms: [
                {
                    id: 1,
                    name: '신차 구매 상담',
                    description: '테슬라 신차 구매를 고민하시는 분들을 위한 공간',
                    members: 1234,
                    icon: MessageSquare,
                },
                {
                    id: 2,
                    name: '충전 정보 공유',
                    description: '충전소 정보와 팁을 공유하는 공간',
                    members: 856,
                    icon: TrendingUp,
                },
                {
                    id: 3,
                    name: '정기 모임',
                    description: '오프라인 모임과 이벤트 정보',
                    members: 432,
                    icon: Calendar,
                },
            ],
        },
        baby: {
            title: 'Baby Community Room',
            subtitle: '우리 아가를 위한 최고의 육아용품을 만나보세요.',
            rooms: [
                {
                    id: 1,
                    name: '신제품 리뷰',
                    description: '최신 장난감 리뷰와 평가',
                    members: 567,
                    icon: MessageSquare,
                },
                {
                    id: 2,
                    name: '수집가 모임',
                    description: '희귀 아이템 정보 공유',
                    members: 234,
                    icon: Users,
                },
                {
                    id: 3,
                    name: '교환/거래',
                    description: '안전한 거래 공간',
                    members: 789,
                    icon: TrendingUp,
                },
            ],
        },
    };

    const config = categoryConfig[category];

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">
                    <Users className="inline-block h-12 w-12 mr-4 text-tesla-red" />
                    {config.title}
                </h1>
                <p className="text-foreground/60 text-xl">{config.subtitle}</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
                {config.rooms.map((room, idx) => (
                    <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="p-8 rounded-2xl border border-foreground/10 hover:border-tesla-red transition-all cursor-pointer"
                    >
                        <room.icon className="h-12 w-12 mb-4 text-tesla-red" />
                        <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                        <p className="text-foreground/60 mb-4">{room.description}</p>
                        <div className="flex items-center gap-2 text-sm text-foreground/40">
                            <Users className="h-4 w-4" />
                            <span>{room.members.toLocaleString()} members</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
