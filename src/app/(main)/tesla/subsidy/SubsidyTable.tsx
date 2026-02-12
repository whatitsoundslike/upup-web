'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import { AlertTriangle, Search } from 'lucide-react';

interface City {
    locationName1: string;
    locationName2: string;
    totalCount: number;
    recievedCount: number;
    releaseCount: number;
    remainCount: number;
    etc: string | null;
}

// Set for O(1) lookups
const METRO_CITIES = new Set(['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '공단', '제주']);

// Memoized table row component
interface CityRowProps {
    city: City;
}

const CityRow = memo(function CityRow({ city }: CityRowProps) {
    const rate = city.totalCount > 0
        ? Math.round((city.remainCount / city.totalCount) * 1000) / 10
        : 0;

    const locationName = METRO_CITIES.has(city.locationName1)
        ? city.locationName1
        : `${city.locationName1} ${city.locationName2}`;

    return (
        <tr className="hover:bg-foreground/[0.02] transition-colors">
            <td className="px-2 py-2 md:px-2 md:py-5 font-medium text-center text-xs md:text-sm w-[50px] md:w-auto">
                {locationName}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right w-[50px] md:w-auto">
                {city.totalCount.toLocaleString()}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right w-[50px] md:w-auto">
                {city.recievedCount.toLocaleString()}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 font-mono text-xs md:text-sm text-foreground/60 text-right w-[50px] md:w-auto">
                {city.releaseCount.toLocaleString()}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 font-mono text-xs md:text-sm text-right w-[50px] md:w-auto hidden md:table-cell">
                {city.remainCount.toLocaleString()}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 text-right hidden md:table-cell">
                {city.totalCount > 0 ? (
                    <span className="text-foreground/40">{rate}%</span>
                ) : (
                    <span className="text-foreground/20">-</span>
                )}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-5 text-right hidden md:table-cell max-w-[300px] break-words">
                <span className="text-xs text-foreground/50 font-medium whitespace-pre-line">
                    {city.etc || '-'}
                </span>
            </td>
        </tr>
    );
});

interface SubsidyTableProps {
    initialData: City[];
}

export default function SubsidyTable({ initialData }: SubsidyTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCities = useMemo(() => {
        if (!searchTerm) return initialData;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return initialData.filter((city) =>
            city.locationName1.toLowerCase().includes(lowerSearchTerm) ||
            city.locationName2.toLowerCase().includes(lowerSearchTerm)
        );
    }, [initialData, searchTerm]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const emptyResultRow = (
        <tr>
            <td colSpan={7} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-foreground/20" />
                    <p className="text-foreground/40 font-medium italic uppercase tracking-widest text-sm">
                        No results found for &quot;{searchTerm}&quot;
                    </p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-tesla-red transition-colors" />
                <input
                    type="text"
                    placeholder="지역명을 검색하세요 (예: 서울, 수원, 경기)"
                    className="w-full bg-foreground/5 border border-foreground/10 h-14 pl-12 pr-4 rounded-2xl outline-none focus:border-tesla-red/50 focus:ring-4 focus:ring-tesla-red/5 transition-all text-lg font-medium"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="glass overflow-hidden rounded-3xl border border-white/10 shadow-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[320px] md:min-w-[800px]">
                    <thead className="bg-foreground/5">
                        <tr>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-center">지역</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-center">전체</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right">접수</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right">출고</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">잔여</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">잔여율</th>
                            <th className="px-1 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-tight text-foreground/50 text-right hidden md:table-cell">비고</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                                <CityRow
                                    key={`${city.locationName1}-${city.locationName2}`}
                                    city={city}
                                />
                            ))
                        ) : (
                            emptyResultRow
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
