'use client';

interface CoupangLeftBanner {
    className?: string;
}

export default function CoupangLeftBanner({ className = '' }: CoupangLeftBanner) {
    const html = `
    <script src="https://ads-partners.coupang.com/g.js"></script>
<script>
	new PartnersCoupang.G({"id":962208,"template":"carousel","trackingCode":"AF8628034","width":"200","height":"200","tsource":""});
</script>
  `

    return <div dangerouslySetInnerHTML={{ __html: html }} />
}
