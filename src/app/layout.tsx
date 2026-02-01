import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar, MobileBottomNav } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Script from "next/script";


export const metadata: Metadata = {
  title: "ZROOM - 관심사로 연결되는 우리들의 공간",
  description: "아직도 혼자 해? ZROOM에서 너와 딱 맞는 취미 방에 입장해 봐. 지금 가장 핫한 취향들이 실시간으로 모이는 곳!",
  keywords: "ZROOM, 지룸, 취미SNS, 관심사채팅, 덕질공유, 크루모임, 실시간소통",
  verification: {
    other: {
      "naver-site-verification": ["196a85f45ff62dd9232a26913f0f94810a666565"],
      "google-adsense-account": ["ca-pub-9022610770581393"],
    },
  },
  openGraph: {
    title: "ZROOM - 관심사로 연결되는 우리들의 공간",
    description: "아직도 혼자 해? ZROOM에서 너와 딱 맞는 취미 방에 입장해 봐. 지금 가장 핫한 취향들이 실시간으로 모이는 곳!",
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
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
