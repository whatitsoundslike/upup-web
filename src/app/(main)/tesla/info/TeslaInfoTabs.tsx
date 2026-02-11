'use client';

import { useState } from 'react';
import { Zap, Wallet } from 'lucide-react';
import TeslaChargerMap from '../charger/TeslaChargerMap';
import TeslaSubsidy from '../subsidy/TeslaSubsidy';

type TabType = 'charger' | 'subsidy';

export default function TeslaInfoTabs() {
    const [activeTab, setActiveTab] = useState<TabType>('subsidy');

    return (
        <div className="flex flex-col h-screen">
            {/* Tab Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('subsidy')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'subsidy'
                                ? 'bg-tesla-red text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>보조금 현황</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('charger')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            activeTab === 'charger'
                                ? 'bg-tesla-red text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Zap className="w-4 h-4" />
                        <span>슈퍼차저</span>
                    </button>
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
                        <TeslaSubsidy />
                    </div>
                )}
            </div>
        </div>
    );
}
