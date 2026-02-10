import type { Metadata } from 'next';
import RoomFeed from '@/components/room/RoomFeed';

export const metadata: Metadata = {
    title: '테슬라 Room - ZROOM',
    description: '테슬라 오너들의 아이템과 기록을 구경해보세요.',
};

export default function TeslaRoomPage() {
    return <RoomFeed category="tesla" />;
}
