import type { Metadata } from 'next';
import RoomFeed from '@/components/room/RoomFeed';

export const metadata: Metadata = {
    title: '반려동물 Room - ZROOM',
    description: '반려동물과의 일상을 공유하고 소통해보세요.',
};

export default function PetRoomPage() {
    return <RoomFeed category="pet" />;
}
