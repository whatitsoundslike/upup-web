import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar, MobileBottomNav } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Script from "next/script";


export const metadata: Metadata = {
  title: "ZROOM - 취미로 연결되는 우리들의 공간",
  description: "아직도 혼자 해? ZROOM에서 너와 딱 맞는 취미 방에 입장해 봐. 지금 가장 핫한 취향들이 실시간으로 모이는 곳!",
  keywords: "ZROOM, 지룸, 취미SNS, 관심사채팅, 덕질공유, 크루모임, 실시간소통",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
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
