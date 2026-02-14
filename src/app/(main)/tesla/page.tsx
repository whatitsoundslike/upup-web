import type { Metadata } from 'next';
import { fetchLatestNews } from '@/components/newsData';
import CategoryHome from '@/components/CategoryHome';

export const metadata: Metadata = {
  title: "테슬라 오너들의 리얼 소통 공간 - ZROOM Tesla",
  description: "테슬라 정보 공유부터 번개 모임까지, 실제 오너들이 모이는 가장 핫한 테슬라 크루에 합류하세요.",
  keywords: "테슬라, 테슬라코리아, 테슬라모델3, 테슬라모델Y, 테슬라뉴스, 테슬라보조금",
  openGraph: {
    title: "테슬라 오너들의 리얼 소통 공간 - ZROOM Tesla",
    description: "테슬라 정보 공유부터 번개 모임까지, 실제 오너들이 모이는 가장 핫한 테슬라 크루에 합류하세요.",
    url: "https://zroom.io/tesla",
    siteName: "ZROOM",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://zroom.io/tesla_thumbnail.webp",
        width: 1200,
        height: 630,
        alt: "ZROOM",
      },
    ],
  },
  alternates: {
    canonical: "https://zroom.io/tesla",
  },
};

export default async function Page() {
  const newsData = await fetchLatestNews('tesla', 3);

  return <CategoryHome category="tesla" newsData={newsData} />;
}
