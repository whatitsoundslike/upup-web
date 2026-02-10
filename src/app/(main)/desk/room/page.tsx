import type { Metadata } from 'next';
import RoomFeed from '@/components/room/RoomFeed';

export const metadata: Metadata = {
    title: '데스크 Room - ZROOM',
    description: '데스크테리어 아이템과 기록을 구경해보세요.',
};

export default function DeskRoomPage() {
    return <RoomFeed category="desk" />;
}
