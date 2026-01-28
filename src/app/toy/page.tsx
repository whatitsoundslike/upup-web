import type { Metadata } from 'next';
import ToyHome from './ToyHome';

export const metadata: Metadata = {
    title: "토이 & 피규어 컬렉터들의 성지 - ZROOM Toy",
    description: "레고, 피규어, RC카까지! 나만의 수집품을 자랑하고 정보를 나누는 즐거운 공간.",
    keywords: "피규어수집, 레고마니아, 건담프라모델, RC카, 토이커뮤니티, 키덜트",
    openGraph: {
        title: "토이 & 피규어 컬렉터들의 성지 - ZROOM Toy",
        description: "레고, 피규어, RC카까지! 나만의 수집품을 자랑하고 정보를 나누는 즐거운 공간.",
        url: "https://zroom.io/toy",
        siteName: "ZROOM",
        locale: "ko_KR",
        type: "website",
    },
    alternates: {
        canonical: "https://zroom.io/toy",
    },
};

export default function Page() {
    return <ToyHome />;
}
