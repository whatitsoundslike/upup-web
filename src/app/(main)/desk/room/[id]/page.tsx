import type { Metadata } from 'next';
import RoomDetailClient from '@/components/room/RoomDetailClient';

export const metadata: Metadata = {
    title: '룸 상세 - 데스크 Room',
    description: '데스크 룸을 구경해보세요.',
};

export default async function DeskRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RoomDetailClient roomId={id} category="desk" />;
}
