'use client';

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Globe, ArrowRight, DockIcon } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: '뉴스',
    desc: '테슬라 뉴스를 확인하세요.',
    icon: DockIcon,
    href: '/tesla/news',
    color: 'text-blue-500'
  },
  {
    title: '보조금 현황',
    desc: '2026년 지자체별 전기차 보조금 잔여 현황을 확인하세요.',
    icon: Zap,
    href: '/tesla/subsidy',
    color: 'text-blue-500'
  },
  {
    title: '악세사리 스토어',
    desc: '당신의 테슬라를 위한 머스트-해브 아이템.',
    icon: ShieldCheck,
    href: '/tesla/shop',
    color: 'text-tesla-red'
  },
  {
    title: '룸',
    desc: '테슬라 오너들의 차에는 무엇이 있을까요? 사용자들의 꿀팁 확인하기.',
    icon: Cpu,
    href: '/tesla/room',
    color: 'text-emerald-500'
  },
  {
    title: '커뮤니티',
    desc: '테슬라 오너들의 지식 공유 공간.',
    icon: Globe,
    href: '/tesla/community',
    color: 'text-purple-500'
  }
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b -z-10" />

      {/* Grid Features */}
      <section className="py-24 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-2xl group transition-all"
              >
                <div className={`p-3 rounded-xl bg-white/10 w-fit mb-6 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed mb-6">
                  {feature.desc}
                </p>
                <Link
                  href={feature.href}
                  className="text-sm font-bold flex items-center gap-1 group-hover:text-tesla-red transition-colors"
                >
                  자세히 보기 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Sneak Peak */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-4">LATEST NEWS</h2>
            <p className="text-foreground/60">테슬라와 전기차 시장의 가장 빠른 소식</p>
          </div>
          <Link href="/tesla/news" className="text-sm font-bold hover:text-tesla-red transition-colors">전체보기</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video rounded-2xl overflow-hidden bg-foreground/5 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {/* Placeholder for images */}
                <div className="w-full h-full flex items-center justify-center text-foreground/20 italic">
                  Tesla Image {i}
                </div>
              </div>
              <span className="text-xs font-bold text-tesla-red uppercase tracking-widest">Update</span>
              <h4 className="text-xl font-bold mt-2 group-hover:underline underline-offset-4 decoration-tesla-red">
                테슬라 2026 신형 모델 3 하이랜더 발표 포인트 {i}
              </h4>
              <p className="text-sm text-foreground/60 mt-3 line-clamp-2">
                이번 업데이트에서는 주행 거리뿐만 아니라 승차감과 정숙성에서 비약적인 발전이 있었습니다...
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
