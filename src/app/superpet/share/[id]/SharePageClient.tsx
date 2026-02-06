'use client';

import { motion } from 'framer-motion';
import { PawPrint, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/(main)/superpet/i18n/LanguageContext';

interface ShareCharacterData {
    name: string;
    level: number;
    className: string;
    element: string;
    image?: string;
}

interface SharePageClientProps {
    character: ShareCharacterData | null;
}

// 속성별 색상 (불, 물, 풍, 땅)
const ELEMENT_COLORS: Record<string, string> = {
    '불': 'bg-gradient-to-r from-red-500 to-orange-500',
    '물': 'bg-gradient-to-r from-blue-500 to-cyan-400',
    '풍': 'bg-gradient-to-r from-emerald-500 to-teal-400',
    '땅': 'bg-gradient-to-r from-amber-600 to-yellow-500',
};

// 직업별 색상 (워리어, 팔라딘, 어쌔신)
const CLASS_COLORS: Record<string, string> = {
    '워리어': 'bg-gradient-to-r from-red-600 to-rose-500',
    '팔라딘': 'bg-gradient-to-r from-sky-500 to-blue-400',
    '어쌔신': 'bg-gradient-to-r from-purple-600 to-violet-500',
};

export default function SharePageClient({ character }: SharePageClientProps) {
    const { lang } = useLanguage();

    if (!character) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <PawPrint className="h-16 w-16 text-foreground/20 mb-4" />
                <h1 className="text-xl font-bold mb-2">
                    {lang === 'ko' ? '캐릭터를 찾을 수 없습니다' : 'Character not found'}
                </h1>
                <p className="text-foreground/60 mb-6 text-center">
                    {lang === 'ko'
                        ? '삭제되었거나 존재하지 않는 캐릭터입니다.'
                        : 'This character has been deleted or does not exist.'}
                </p>
                <Link
                    href="/superpet"
                    className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                >
                    {lang === 'ko' ? '슈퍼펫 시작하기' : 'Start Super Pet'}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mx-auto"
            >
                {/* 캐릭터 카드 */}
                <div className="relative">
                    {character.image ? (
                        <img
                            src={character.image}
                            alt={character.name}
                            className="h-[300px] object-cover mx-auto"
                        />
                    ) : (
                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <PawPrint className="h-24 w-24 text-white/50" />
                        </div>
                    )}
                </div>
                {/* 오버레이 정보 - 게임 스타일 태그 */}
                <div className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* 레벨 태그 */}
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-sm font-bold shadow-md">
                            Lv.{character.level}
                        </span>
                        {/* 클래스 태그 */}
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-bold shadow-md ${CLASS_COLORS[character.className] || 'bg-gradient-to-r from-zinc-500 to-zinc-400'}`}>
                            {character.className}
                        </span>
                        {/* 속성 태그 */}
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-bold shadow-md ${ELEMENT_COLORS[character.element] || 'bg-gradient-to-r from-zinc-500 to-zinc-400'}`}>
                            {character.element}
                        </span>
                    </div>
                </div>

                {/* 초대 메시지 */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <span className="text-lg font-bold">
                            {lang === 'ko' ? '슈퍼펫에 초대합니다!' : 'You are invited to Super Pet!'}
                        </span>
                        <Sparkles className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="text-foreground/60 text-sm">
                        {lang === 'ko'
                            ? '우리집 댕댕이로 모험을 떠나보세요!'
                            : 'Let\'s go on an adventure with our own cute pet!'}
                    </p>
                </div>

                {/* CTA 버튼 */}
                <Link
                    href="/superpet"
                    className="block w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg text-center"
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" />
                        {lang === 'ko' ? '친구와 함께하기' : 'Play with Friends'}
                    </span>
                </Link>
            </motion.div>
        </div>
    );
}
