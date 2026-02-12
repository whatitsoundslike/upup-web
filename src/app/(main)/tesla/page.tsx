import type { Metadata } from 'next';
import TeslaHome from './TeslaHome';

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

// ISR: 1시간마다 재검증
export const revalidate = 3600;

interface NewsItem {
  source: string;
  title: string;
  link: string;
  thumbnail: string | null;
  description?: string;
  published_at: string | null;
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/whatitsoundslike/upup-admin/refs/heads/main/data/tesla_news.json',
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const data: NewsItem[] = await response.json();
    // 서버에서 랜덤 3개 선택 (ISR 캐시 동안 동일한 결과 유지)
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Page() {
  const newsData = await getNews();

  return <TeslaHome newsData={newsData} />;
}
