import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Script from "next/script";


export const metadata: Metadata = {
  title: "ZROOM - 관심사로 연결되는 우리들의 공간",
  description: "Zroom, 내 방이 곧 나의 세계 🏠✨ 취미와 관심사로 가득 찬 나만의 공간을 기록하고, 비슷한 취향을 가진 사람들과 만나보세요. 덕질 아이템부터 소소한 컬렉션까지, 우리 각자의 특별한 이야기가 시작됩니다.",
  keywords: "ZROOM, 지룸, 취미SNS, 관심사채팅, 덕질공유, 크루모임, 실시간소통",
  verification: {
    other: {
      "naver-site-verification": ["196a85f45ff62dd9232a26913f0f94810a666565"],
      "google-adsense-account": ["ca-pub-9022610770581393"],
    },
  },
  openGraph: {
    title: "ZROOM - 관심사로 연결되는 우리들의 공간",
    description: "Zroom, 내 방이 곧 나의 세계 🏠✨ 취미와 관심사로 가득 찬 나만의 공간을 기록하고, 비슷한 취향을 가진 사람들과 만나보세요. 덕질 아이템부터 소소한 컬렉션까지, 우리 각자의 특별한 이야기가 시작됩니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "ZROOM",
    images: [
      {
        url: "https://zroom.io/og_image.jpg",
        width: 1200,
        height: 630,
        alt: "ZROOM",
      },
    ],
    url: "https://zroom.io",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9022610770581393"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden">
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-V8Q70CN6GV"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-V8Q70CN6GV');
          `}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
