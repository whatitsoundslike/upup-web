export type RankingEntry = {
    rankScore: number;
    characterId: string;
    name: string;
    image: string | null;
    stats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
    };
    level: number | null;
    className: string | null;
    element: string | null;
};

export type RankingData = {
    data: RankingEntry[];
    updatedAt: string | null;
};

export async function fetchRankingData(): Promise<RankingData> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zroom.io';
    const res = await fetch(`${baseUrl}/api/superpet/ranking`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        return { data: [], updatedAt: null };
    }

    const payload = await res.json();
    return {
        data: Array.isArray(payload?.data) ? payload.data : [],
        updatedAt: payload?.updatedAt ?? null,
    };
}
