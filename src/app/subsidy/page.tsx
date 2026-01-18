'use client';

import { motion } from 'framer-motion';
import { Coins, MapPin, Info, AlertTriangle } from 'lucide-react';

const cities = [
    { name: '서울특별시', subsidy: '8,400,000', stock: '매우 여유', rate: 15 },
    { name: '경기도', subsidy: '9,200,000', stock: '여유', rate: 42 },
    { name: '부산광역시', subsidy: '8,800,000', stock: '소진 임박', rate: 88 },
    { name: '인천광역시', subsidy: '9,000,000', stock: '여유', rate: 35 },
    { name: '대구광역시', subsidy: '10,500,000', stock: '소진', rate: 100 },
    { name: '대전광역시', subsidy: '9,500,000', stock: '여유', rate: 28 },
];

export default function SubsidyPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">보조금 현황</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 현황을 실시간으로 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass overflow-hidden rounded-3xl">
                        <table className="w-full text-left">
                            <thead className="bg-foreground/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/60">지역명</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/60">지원금 최대</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/60">집행율</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-foreground/60">현황</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-white/5">
                                {cities.map((city) => (
                                    <tr key={city.name} className="hover:bg-foreground/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-bold flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-foreground/40" />
                                            {city.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">{city.subsidy}원</td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${city.rate > 80 ? 'bg-tesla-red' : 'bg-foreground'}`}
                                                    style={{ width: `${city.rate}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold">
                                            <span className={city.rate === 100 ? 'text-tesla-red' : 'text-foreground/60'}>
                                                {city.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
