import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Travel World - 꿈꾸던 여행을 떠나세요",
  description: "전 세계의 특별한 여행 상품을 만나보세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
