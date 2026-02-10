import type { Metadata } from 'next';
import RoomFeed from '@/components/room/RoomFeed';

export const metadata: Metadata = {
    title: 'AI Room - ZROOM',
    description: 'AI 관련 아이템과 기록을 구경해보세요.',
};

export default function AIRoomPage() {
    return <RoomFeed category="ai" />;
}
