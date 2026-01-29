'use client';

import { useEffect, useState } from 'react';
import { get1HourVersion } from '@/lib/utils';
import { AlertTriangle, Search } from 'lucide-react';


interface City {
    locationName1: string;
    locationName2: string;
    totalCount: number;
    recievedCount: number;
    releaseCount: number;
    remainCount: number;
    etc: string;
}

export default function TeslaSubsidy() {
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/grapheople/jroom/refs/heads/main/json/electriccar_subside.json?v=' + get1HourVersion());
                const data = await response.json();
                setCities(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCities();
    }, []);

    const filteredCities = cities.filter((city) =>
        city.locationName1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.locationName2.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-tesla-red/20 border-t-tesla-red rounded-full animate-spin" />
                    <p className="text-foreground/60 font-medium">데이터를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-tesla-red transition-colors" />
                        <input
                            type="text"
                            placeholder="지역명을 검색하세요 (예: 서울, 수원, 경기)"
                            className="w-full bg-foreground/5 border border-foreground/10 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-tesla-red/50 focus:ring-4 focus:ring-tesla-red/5 transition-all text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="glass overflow-hidden rounded-3xl border border-white/10 shadow-2xl overflow-x-auto">
                        <table className="w-full text-left min-w-[320px] md:min-w-[800px]">
                            <thead className="bg-foreground/5">
                                <tr>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-center">지역</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">전체</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right">접수</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right">출고</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right">잔여</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">잔여율</th>
                                    <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">비고</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {filteredCities.map((city) => {
                                    const rate = Math.round((city.remainCount / city.totalCount) * 1000) / 10;
                                    return (
                                        <tr key={`${city.locationName1}-${city.locationName2}`} className="">
                                            <td className="px-0.5 py-2.5 md:px-2 md:py-5 font-medium text-center text-xs md:text-sm w-[50px] md:w-auto">
                                                {city.locationName1}
                                                {!['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '공단', '제주'].includes(city.locationName1) && ` ${city.locationName2}`}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right hidden md:table-cell w-[50px] md:w-auto">
                                                {city.totalCount.toLocaleString()}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right w-[50px] md:w-auto">
                                                {city.recievedCount.toLocaleString()}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right w-[50px] md:w-auto">
                                                {city.releaseCount.toLocaleString()}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 font-mono text-xs md:text-sm text-right w-[50px] md:w-auto">
                                                {city.remainCount.toLocaleString()}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 text-right hidden md:table-cell">
                                                {city.totalCount > 0 ? (
                                                    <span className="text-foreground/40">
                                                        {rate}%
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground/20">-</span>
                                                )}
                                            </td>
                                            <td className="px-0.5 py-2.5 md:px-6 md:py-5 text-right hidden md:table-cell max-w-[300px] break-words">
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
            </div>
        </div>
    );
}
