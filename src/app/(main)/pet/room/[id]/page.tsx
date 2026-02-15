import type { Metadata } from 'next';
import RoomDetailClient from '@/components/room/RoomDetailClient';

export const metadata: Metadata = {
    title: '룸 상세 - 반려동물 Room',
    description: '반려동물 룸을 구경해보세요.',
};

export default async function PetRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RoomDetailClient roomId={id} category="pet" />;
}
