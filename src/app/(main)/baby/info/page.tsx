import type { Metadata } from 'next';
import RoomPreparing from '@/components/room/RoomPreparing';

export const metadata: Metadata = {
    title: "꼼꼼한 육아 정보 가이드 - ZROOM Baby Info",
    description: "육아의 모든 것! 월령별 정보부터 필수 아이템까지 전문가와 유저들의 팁을 공유합니다.",
    keywords: "육아정보, 예방접종, 이유식가이드, 육아팁, 월령별발달",
    openGraph: {
        title: "꼼꼼한 육아 정보 가이드 - ZROOM Baby Info",
        description: "육아의 모든 것! 월령별 정보부터 필수 아이템까지 전문가와 유저들의 팁을 공유합니다.",
        url: "https://zroom.io/baby/info",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/baby/info",
    },
};

export default function BabyInfoPage() {
    return <RoomPreparing />;
}
