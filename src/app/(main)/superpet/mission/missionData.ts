import { getItem, setItem } from '../storage';

export interface MissionDef {
    key: string;
    name: string;
    description: string;
    icon: string;
    target: number;
    rewardType: 'feed' | 'gold';
    rewardAmount: number;
    rewardLabel: string;
    counterKey: string | null;
    claimedKey: string;
}

export const MISSIONS: MissionDef[] = [
    {
        key: 'attendance',
        name: '출석체크',
        description: '오늘의 출석 보상을 받으세요!',
        icon: '📋',
        target: 1,
        rewardType: 'feed',
        rewardAmount: 10,
        rewardLabel: '사료 x10',
        counterKey: null,
        claimedKey: 'mission-attendance-claimed',
    },
    {
        key: 'boss_kill',
        name: '보스 퇴치',
        description: '보스 몬스터를 3마리 처치하세요',
        icon: '👹',
        target: 3,
        rewardType: 'gold',
        rewardAmount: 8000,
        rewardLabel: '8,000G',
        counterKey: 'mission-boss-kills',
        claimedKey: 'mission-boss-claimed',
    },
    {
        key: 'normal_kill',
        name: '몬스터 퇴치',
        description: '일반 몬스터를 100마리 처치하세요',
        icon: '⚔️',
        target: 100,
        rewardType: 'gold',
        rewardAmount: 5000,
        rewardLabel: '5,000G',
        counterKey: 'mission-normal-kills',
        claimedKey: 'mission-normal-claimed',
    },
];

function getTodayDateString(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
}

export function checkAndResetMissionDate(): void {
    if (typeof window === 'undefined') return;
    const stored = getItem('mission-date');
    const today = getTodayDateString();
    if (stored !== today) {
        setItem('mission-date', today);
        setItem('mission-boss-kills', '0');
        setItem('mission-normal-kills', '0');
        setItem('mission-attendance-claimed', 'false');
        setItem('mission-boss-claimed', 'false');
        setItem('mission-normal-claimed', 'false');
    }
}

export function getMissionCounter(counterKey: string): number {
    return parseInt(getItem(counterKey) || '0', 10);
}

export function incrementMissionCounter(counterKey: string): number {
    const current = getMissionCounter(counterKey);
    const next = current + 1;
    setItem(counterKey, next.toString());
    return next;
}

export function isMissionClaimed(claimedKey: string): boolean {
    return getItem(claimedKey) === 'true';
}

export function markMissionClaimed(claimedKey: string): void {
    setItem(claimedKey, 'true');
}
