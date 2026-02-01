'use client';

interface CoupangRightBanner {
    className?: string;
}

export default function CoupangRightBanner({ className = '' }: CoupangRightBanner) {
    const html = `
    <a href="https://link.coupang.com/a/dDNfu8" target="_blank" referrerpolicy="unsafe-url"><img src="https://ads-partners.coupang.com/banners/962209?subId=&traceId=V0-301-7e6e8eb8ddfa1bfb-I962209&w=200&h=200" alt=""></a>
  `

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
