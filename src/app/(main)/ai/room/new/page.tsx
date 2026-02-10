import type { Metadata } from 'next';
import RoomCreateForm from '@/components/room/RoomCreateForm';

export const metadata: Metadata = {
    title: '새 콘텐츠 등록 - AI Room',
    description: 'AI 관련 아이템이나 기록을 등록해보세요.',
};

export default function AIRoomNewPage() {
    return <RoomCreateForm category="ai" />;
}
