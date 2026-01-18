import Image from 'next/image';
import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t dark:border-white/10 bg-background pt-12 pb-24 md:pb-12 mt-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4 group">
                            <div className="relative h-12 w-32">
                                <Image
                                    src="/logo.png"
                                    alt="Tesla Logo"
                                    fill
                                    className="object-contain group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <span className="sr-only">TESLA EV</span>
                        </Link>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                            테슬라 오너와 팬들을 위한 가장 앞선 웹 서비스.
                            최신 기술 소식부터 커뮤니티 정보까지 한눈에 확인하세요.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">서비스</h3>
                        <ul className="space-y-2">
                            <li><Link href="/news" className="text-sm text-foreground/60 hover:text-tesla-red transition-colors">최신 소식</Link></li>
                            <li><Link href="/subsidy" className="text-sm text-foreground/60 hover:text-tesla-red transition-colors">보조금 현황</Link></li>
                            <li><Link href="/shop" className="text-sm text-foreground/60 hover:text-tesla-red transition-colors">악세사리</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">커뮤니티</h3>
                        <ul className="space-y-2">
                            <li><Link href="/community" className="text-sm text-foreground/60 hover:text-tesla-red transition-colors">자유게시판</Link></li>
                            <li><Link href="/tips" className="text-sm text-foreground/60 hover:text-tesla-red transition-colors">정비 및 팁</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">소셜</h3>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 rounded-full bg-foreground/5 hover:text-tesla-red transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-foreground/5 hover:text-tesla-red transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-foreground/5 hover:text-tesla-red transition-colors">
                                <Mail className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-foreground/40">
                        © 2026 Tesla EV Service. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="text-xs text-foreground/40 hover:text-foreground">이용약관</Link>
                        <Link href="/privacy" className="text-xs text-foreground/40 hover:text-foreground">개인정보처리방침</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
