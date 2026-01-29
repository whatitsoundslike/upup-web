'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface TipItem {
    id: string;
    title: string;
    thumbnail: string;
    summary: string;
    content: string;
}

const dummyTips: TipItem[] = [
    {
        id: "1",
        title: "겨울철 주행거리 최적화 팁",
        thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
        summary: "겨울철에는 프리컨디셔닝을 적극 활용하세요. 충전 중 미리 배터리 온도를 높여두면 주행 거리를 보존할 수 있습니다.",
        content: `
겨울철에는 배터리 성능이 저하되어 주행거리가 줄어들 수 있습니다. 하지만 몇 가지 팁을 활용하면 이를 최소화할 수 있습니다.

## 프리컨디셔닝 활용
충전 중 미리 배터리 온도를 높여두면 주행 거리를 보존할 수 있습니다. 출발 전 Tesla 앱에서 프리컨디셔닝을 예약하세요.

## 회생 제동 활용
겨울철에는 회생 제동이 제한될 수 있습니다. 부드러운 운전으로 브레이크 사용을 최소화하세요.

## 히팅 시스템 관리
시트 히터를 히터보다 우선적으로 사용하면 에너지를 절약할 수 있습니다.
        `
    },
    {
        id: "2",
        title: "오토파일럿 안전한 사용법",
        thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
        summary: "오토파일럿 사용 시 항상 핸들을 잡고 전방을 주시해야 합니다. 악천후 시에는 사용을 자제하는 것이 좋습니다.",
        content: `
오토파일럿은 편리한 기능이지만, 안전하게 사용하는 것이 중요합니다.

## 항상 집중력 유지
오토파일럿은 운전 보조 기능입니다. 항상 핸들을 잡고 전방을 주시해야 합니다.

## 악천후 시 주의
비, 눈, 안개 등 악천후 시에는 오토파일럿의 성능이 제한될 수 있습니다. 이런 경우 사용을 자제하는 것이 좋습니다.

## 정기적인 카메라 청소
오토파일럿은 카메라에 의존합니다. 정기적으로 카메라를 깨끗하게 유지하세요.

## 소프트웨어 업데이트
Tesla는 지속적으로 오토파일럿 기능을 개선하고 있습니다. 항상 최신 소프트웨어를 유지하세요.
        `,
    },
    {
        id: "3",
        title: "슈퍼차저 이용 에티켓",
        thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
        summary: "충전이 완료되면 즉시 이동하여 다음 차량을 배려해주세요. 점거 수수료가 발생할 수 있습니다.",
        content: `
슈퍼차저를 이용할 때는 다른 Tesla 오너들을 배려하는 것이 중요합니다.

## 충전 완료 후 즉시 이동
충전이 완료되면 가능한 한 빨리 차량을 이동시켜주세요. 점거 수수료가 발생할 수 있습니다.

## 80% 충전 규칙
배터리가 80% 이상이면 충전 속도가 크게 느려집니다. 다른 사람을 위해 80%까지만 충전하고 이동하는 것을 고려해보세요.

## 케이블 정리
충전이 끝나면 케이블을 깔끔하게 정리해주세요.

## 주차 공간 활용
가능한 한 충전기 가까이 주차하여 케이블이 충분히 닿도록 하고, 다른 차량의 주차를 방해하지 않도록 주의하세요.
        `,
    }
];

export default function TipDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const tip = dummyTips.find((t) => t.id === id);

    if (!tip) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section with Image */}
            <div className="relative h-[60vh] overflow-hidden">
                <img
                    src={tip.thumbnail}
                    alt={tip.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative -mt-32 max-w-4xl mx-auto px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    {/* Back Button */}
                    <Link
                        href="/tesla/tips"
                        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-tesla-red transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        목록으로 돌아가기
                    </Link>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {tip.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 mb-8 pb-8 border-b border-foreground/10">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: tip.title,
                                        text: tip.summary,
                                        url: window.location.href,
                                    });
                                }
                            }}
                            className="flex items-center gap-2 hover:text-tesla-red transition-colors ml-auto"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>공유하기</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg prose-invert max-w-none">
                        <div
                            className="whitespace-pre-line text-foreground/80 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: tip.content.replace(/\n## /g, '\n<h2 class="text-2xl font-bold mt-8 mb-4">').replace(/\n/g, '<br />') }}
                        />
                    </div>
                </motion.div>

                {/* Related Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12"
                >
                    <h2 className="text-2xl font-bold mb-6">다른 팁</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dummyTips
                            .filter((t) => t.id !== tip.id)
                            .slice(0, 2)
                            .map((relatedTip) => (
                                <Link
                                    key={relatedTip.id}
                                    href={`/tesla/tips/${relatedTip.id}`}
                                    className="glass rounded-xl overflow-hidden group hover:shadow-xl transition-all"
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={relatedTip.thumbnail}
                                            alt={relatedTip.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-2 group-hover:text-tesla-red transition-colors line-clamp-2">
                                            {relatedTip.title}
                                        </h3>
                                        <p className="text-sm text-foreground/60 line-clamp-2">
                                            {relatedTip.summary}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
