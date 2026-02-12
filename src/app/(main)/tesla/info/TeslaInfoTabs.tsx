'use client';

import { useState, memo, useCallback } from 'react';
import { Zap, Wallet } from 'lucide-react';
import dynamic from 'next/dynamic';
import SubsidyTable from '../subsidy/SubsidyTable';
import type { SubsidyItem } from '@/components/subsidy/subsidyData';

// Dynamic import for heavy Google Maps component (bundle-dynamic-imports)
const TeslaChargerMap = dynamic(
    () => import('../charger/TeslaChargerMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-tesla-red/20 border-t-tesla-red rounded-full animate-spin" />
                    <p className="text-foreground/60 font-medium text-sm">지도를 불러오는 중...</p>
                </div>
            </div>
        ),
    }
);

type TabType = 'charger' | 'subsidy';

// Memoized tab button component (rerender-memo)
interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const TabButton = memo(function TabButton({ isActive, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-tesla-red text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
});

interface TeslaInfoTabsProps {
    subsidies: SubsidyItem[];
}

export default function TeslaInfoTabs({ subsidies }: TeslaInfoTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('subsidy');

    // Stable callback references (rerender-functional-setstate)
    const handleSubsidyClick = useCallback(() => setActiveTab('subsidy'), []);
    const handleChargerClick = useCallback(() => setActiveTab('charger'), []);

    return (
        <div className="flex flex-col h-screen">
            {/* Tab Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
                <div className="flex gap-2">
                    <TabButton
                        isActive={activeTab === 'subsidy'}
                        onClick={handleSubsidyClick}
                        icon={<Wallet className="w-4 h-4" />}
                        label="보조금 현황"
                    />
                    <TabButton
                        isActive={activeTab === 'charger'}
                        onClick={handleChargerClick}
                        icon={<Zap className="w-4 h-4" />}
                        label="슈퍼차저"
                    />
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'charger' ? (
                    <div className="h-full">
                        <TeslaChargerMap embedded />
                    </div>
                ) : (
                    <div className="h-full overflow-auto">
                        <div className="max-w-7xl mx-auto px-4 py-16">
                            <div className="mb-12">
                                <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">SUBSIDY STATUS</h1>
                                <p className="text-foreground/60 text-lg">2026년 지자체별 전기차 보조금 실시간 접수 현황 (전기승용 기준)</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <SubsidyTable initialData={subsidies} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
