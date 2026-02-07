import type { Metadata } from 'next';
import SuperpetHome from './SuperpetHome';

export const metadata: Metadata = {
    title: '우리집 멍냥이와 함께하는 RPG 모험! - ZROOM Superpet',
    description: '반려동물 정보로 게임 캐릭터를 생성하고, 던전에서 배틀하세요. 펫 기반 RPG 커뮤니티.',
    keywords: '반려동물게임, 펫RPG, 슈퍼펫, 반려동물캐릭터, 펫던전, 반려동물커뮤니티',
    openGraph: {
        title: '우리집 멍냥이와 함께하는 RPG 모험! - ZROOM Superpet',
        description: '반려동물 정보로 게임 캐릭터를 생성하고, 던전에서 배틀하세요.',
        url: 'https://zroom.io/superpet',
        siteName: 'ZROOM',
        locale: 'ko_KR',
        type: 'website',
        images: [
            {
                url: "https://zroom.io/superpet_thumbnail.webp",
                width: 640,
                height: 320,
                alt: "ZROOM - Superpet",
            },
        ],
    },
    alternates: {
        canonical: 'https://zroom.io/superpet',
    },
};

export default function Page() {
    return <SuperpetHome />;
}
