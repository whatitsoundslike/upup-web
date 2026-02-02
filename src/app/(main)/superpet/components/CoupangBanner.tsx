'use client';

import Link from "next/link";

interface CoupangBannerProps {
    className?: string;
}

export default function CoupangBanner({ className = '' }: CoupangBannerProps) {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <Link href="https://link.coupang.com/a/dDM4KV" target="_blank" rel="noreferrer">
                <img
                    src="/banner/superpet_banner.png"
                    alt="Coupang Ad"
                    className="rounded-lg shadow-md max-w-full h-auto"
                />
            </Link>
        </div>
    );
}
