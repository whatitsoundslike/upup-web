import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTipData } from '../tipData';
import TipDetail from './TipDetail';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const tips = await fetchTipData();
    const tip = tips.find((t) => t.id === id);

    if (!tip) {
        return { title: '팁을 찾을 수 없습니다 - ZROOM' };
    }

    return {
        title: `${tip.title} - ZROOM Tesla Tips`,
        description: tip.summary,
        keywords: `테슬라팁, ${tip.title}, 테슬라가이드, 전기차꿀팁`,
        openGraph: {
            title: `${tip.title} - ZROOM Tesla Tips`,
            description: tip.summary,
            url: `https://zroom.io/tesla/tips/${tip.id}`,
            siteName: 'ZROOM',
            images: [{ url: tip.thumbnail }],
            locale: 'ko_KR',
            type: 'article',
        },
        alternates: {
            canonical: `https://zroom.io/tesla/tips/${tip.id}`,
        },
    };
}

export default async function TipDetailPage({ params }: PageProps) {
    const { id } = await params;
    const tips = await fetchTipData();
    const tip = tips.find((t) => t.id === id);

    if (!tip) {
        notFound();
    }

    const relatedTips = tips.filter((t) => t.id !== tip.id).slice(0, 2);

    return <TipDetail tip={tip} relatedTips={relatedTips} />;
}
