import type { Metadata } from 'next';
import Mission from './Mission';

export const metadata: Metadata = {
    title: '슈퍼펫 일일 미션 - ZROOM Superpet',
    description: '매일 미션을 완료하고 보상을 받으세요!',
    keywords: '슈퍼펫미션, 일일미션, 보상, 출석체크',
    openGraph: {
        title: '슈퍼펫 일일 미션 - ZROOM Superpet',
        description: '매일 미션을 완료하고 보상을 받으세요!',
        url: 'https://zroom.io/superpet/mission',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/mission',
    },
};

export default function MissionPage() {
    return <Mission />;
}
