'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, MapPin, Info, AlertTriangle, Search } from 'lucide-react';
import cities from './cities.json';


export default function SubsidyPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCities = cities.filter((city) =>
        city.locationName1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.locationName2.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-tesla-red transition-colors" />
                        <input
                            type="text"
                            placeholder="지역명 또는 도시명을 검색하세요 (예: 서울, 수원, 경기)"
                            className="w-full bg-foreground/5 border border-foreground/10 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-tesla-red/50 focus:ring-4 focus:ring-tesla-red/5 transition-all text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="glass overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-foreground/5">
                                <tr>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50">지역/도시</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">전체 공고</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">잔여대수</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right">잔여율</th>
                                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-foreground/50 text-right hidden lg:table-cell w-[300px]">비고</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredCities.map((city) => {
                                    const remainCount = city.totalCount - city.applyCount;
                                    const rate = Math.round((remainCount / city.totalCount) * 1000) / 10;
                                    return (
                                        <tr key={`${city.locationName1}-${city.locationName2}`} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-1 bg-foreground/5 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:bg-tesla-red/20 group-hover:text-tesla-red transition-colors">
                                                        {city.locationName1}
                                                    </span>
                                                    <span className="font-bold text-sm">{city.locationName2}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-mono text-sm text-foreground/60 text-right">
                                                {city.totalCount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`font-bold text-sm ${rate < 10 ? 'text-tesla-red' : 'text-foreground'}`}>
                                                    {remainCount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {city.totalCount > 0 ? (
                                                    <span className={`font-mono font-bold text-xs ${rate < 10 ? 'text-tesla-red' : 'text-foreground/40'}`}>
                                                        {rate}%
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground/20">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right hidden lg:table-cell max-w-[300px] break-words">
                                                <span className="text-xs text-foreground/50 font-medium whitespace-pre-line">
                                                    {city.etc || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCities.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <AlertTriangle className="h-8 w-8 text-foreground/20" />
                                                <p className="text-foreground/40 font-medium italic uppercase tracking-widest text-sm">
                                                    No results found for "{searchTerm}"
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Info (Keeping previous UI style for consistency) */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 italic uppercase">Guidelines</h3>
                        <ul className="space-y-4 text-sm text-foreground/50 font-medium">
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                본 현황은 무공해차 통합누리집 데이터를 바탕으로 실시간 업데이트됩니다.
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                지자체별 상세 공고 내용에 따라 실제 접수 가능 여부가 다를 수 있습니다.
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 w-1 h-1 rounded-full bg-tesla-red border-[3px] border-tesla-red/20" />
                                보조금 소진 임박 지역은 서둘러 신청하시기 바랍니다.
                            </li>
                        </ul>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl p-8 bg-zinc-900 border border-white/5 group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2 italic text-white uppercase tracking-tighter">Tesla Advisor</h3>
                            <p className="text-zinc-500 text-xs mb-8 leading-relaxed font-bold uppercase tracking-widest">
                                Expert assistance with subsidies and purchase procedures.
                            </p>
                            <button className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-tesla-red hover:text-white transition-all active:scale-[0.98]">
                                Contact Advisor
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Coins className="w-48 h-48 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
