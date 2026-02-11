import type { Product, ShopCategory } from './ShopListClient';

const REVALIDATE_SECONDS = 3600; // 1시간

export async function fetchShopData(category: ShopCategory): Promise<Product[]> {
    try {
        const res = await fetch(
            `https://raw.githubusercontent.com/whatitsoundslike/upup-admin/refs/heads/main/data/${category}_shop.json`,
            { next: { revalidate: REVALIDATE_SECONDS } }
        );

        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error(`Failed to fetch ${category} shop data:`, error);
        return [];
    }
}
