import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface SubsidyItem {
    locationName1: string;
    locationName2: string;
    totalCount: number;
    recievedCount: number;
    releaseCount: number;
    remainCount: number;
    etc: string | null;
}

const CACHE_REVALIDATE = 14400; // 4시간
const isDev = process.env.NODE_ENV === 'development';

async function _fetchSubsidyData(): Promise<SubsidyItem[]> {
    const subsidies = await prisma.subsidy.findMany({
        select: {
            locationName1: true,
            locationName2: true,
            totalCount: true,
            recievedCount: true,
            releaseCount: true,
            remainCount: true,
            etc: true,
        },
    });

    return subsidies;
}

const cachedFetchSubsidyData = () =>
    unstable_cache(
        () => _fetchSubsidyData(),
        ['subsidies-list'],
        { revalidate: CACHE_REVALIDATE }
    )();

export async function fetchSubsidyData(): Promise<SubsidyItem[]> {
    return isDev ? _fetchSubsidyData() : cachedFetchSubsidyData();
}
