import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTipById, fetchRelatedTips } from '@/components/tips/tipData';
import TipDetail from '@/components/tips/TipDetail';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const tip = await fetchTipById(id);

    if (!tip) {
        return { title: '팁을 찾을 수 없습니다 - ZROOM' };
    }

    return {
        title: `${tip.title} - ZROOM Desk Tips`,
        description: tip.summary,
        keywords: `데스크팁, ${tip.title}, 데스크셋업`,
        openGraph: {
            title: `${tip.title} - ZROOM Desk Tips`,
            description: tip.summary ?? undefined,
            url: `https://zroom.io/desk/tips/${tip.id}`,
            siteName: 'ZROOM',
            images: tip.thumbnail ? [{ url: tip.thumbnail }] : undefined,
            locale: 'ko_KR',
            type: 'article',
        },
        alternates: {
            canonical: `https://zroom.io/desk/tips/${tip.id}`,
        },
    };
}

export default async function TipDetailPage({ params }: PageProps) {
    const { id } = await params;
    const tip = await fetchTipById(id);

    if (!tip) {
        notFound();
    }

    const relatedTips = await fetchRelatedTips('desk', id, 2);

    return <TipDetail tip={tip} relatedTips={relatedTips} theme="desk" />;
}
