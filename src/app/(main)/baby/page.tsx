import type { Metadata } from 'next';
import BabyHome from './BabyHome';

export const metadata: Metadata = {
    title: "육아 고민 해결 & 정보 공유 - ZROOM Baby",
    description: "초보 부모님들의 찐 소통 공간. 육아 팁 공유부터 우리 아기 자랑까지 함께해요.",
    keywords: "육아정보, 육아커뮤니티, 임신출산, 영유아교육, 육아템추천, 맘카페",
    openGraph: {
        title: "육아 고민 해결 & 정보 공유 - ZROOM Baby",
        description: "초보 부모님들의 찐 소통 공간. 육아 팁 공유부터 우리 아기 자랑까지 함께해요.",
        url: "https://zroom.io/baby",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/baby",
    },
};

export default function Page() {
    return <BabyHome />;
}
