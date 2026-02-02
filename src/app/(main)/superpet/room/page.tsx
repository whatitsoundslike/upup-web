import type { Metadata } from 'next';
import Room from './Room';

export const metadata: Metadata = {
    title: '슈퍼펫 인벤토리 - ZROOM Superpet',
    description: '던전에서 획득한 아이템을 확인하고 관리하세요.',
    keywords: '슈퍼펫인벤토리, 펫아이템, 반려동물RPG',
    openGraph: {
        title: '슈퍼펫 인벤토리 - ZROOM Superpet',
        description: '던전에서 획득한 아이템을 확인하고 관리하세요.',
        url: 'https://zroom.io/superpet/room',
        siteName: 'ZROOM',
        type: 'website',
    },
    alternates: {
        canonical: 'https://zroom.io/superpet/room',
    },
};

export default function SuperpetRoomPage() {
    return <Room />;
}
