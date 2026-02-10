import type { Metadata } from 'next';
import DeskHome from './DeskHome';

export const metadata: Metadata = {
    title: "데스크 셋업 & 인테리어 - ZROOM Desk",
    description: "감성 데스크 셋업, 생산성 도구, 인테리어 팁을 공유하는 공간. 나만의 완벽한 작업 환경을 만들어보세요.",
    keywords: "데스크셋업, 책상인테리어, 작업환경, 데스크테리어, 홈오피스, 생산성",
    openGraph: {
        title: "데스크 셋업 & 인테리어 - ZROOM Desk",
        description: "감성 데스크 셋업, 생산성 도구, 인테리어 팁을 공유하는 공간. 나만의 완벽한 작업 환경을 만들어보세요.",
        url: "https://zroom.io/desk",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/desk",
    },
};

export default function Page() {
    return <DeskHome />;
}
