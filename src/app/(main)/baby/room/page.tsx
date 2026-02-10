import type { Metadata } from 'next';
import RoomFeed from '@/components/room/RoomFeed';

export const metadata: Metadata = {
    title: '육아 Room - ZROOM',
    description: '육아 관련 아이템과 기록을 구경해보세요.',
};

export default function BabyRoomPage() {
    return <RoomFeed category="baby" />;
}
