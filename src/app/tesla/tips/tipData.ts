export interface TipItem {
    id: string;
    category: string;
    title: string;
    thumbnail: string;
    summary: string;
    content: string;
}

const TIP_DATA_URL =
    'https://raw.githubusercontent.com/whatitsoundslike/upup-admin/refs/heads/main/data/tesla_tips.json';

export async function fetchTipData(): Promise<TipItem[]> {
    const res = await fetch(TIP_DATA_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
}
