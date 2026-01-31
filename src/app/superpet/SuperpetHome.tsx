'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, ArrowRight, PawPrint, Shield, Zap, Heart, Gauge, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { generateCharacter, PET_TYPES, PET_TRAITS, type Character, type PetInfo } from './types';

const ELEMENT_COLORS: Record<string, string> = {
    '불': 'bg-red-500',
    '물': 'bg-blue-500',
    '풍': 'bg-emerald-500',
    '땅': 'bg-amber-600',
};

const STAT_CONFIG = [
    { key: 'hp' as const, label: 'HP', icon: Heart, color: 'bg-red-500', max: 200 },
    { key: 'attack' as const, label: '공격력', icon: Zap, color: 'bg-orange-500', max: 80 },
    { key: 'defense' as const, label: '방어력', icon: Shield, color: 'bg-blue-500', max: 80 },
    { key: 'speed' as const, label: '속도', icon: Gauge, color: 'bg-green-500', max: 80 },
];

const features = [
    {
        title: '던전',
        desc: '생성한 캐릭터로 던전에 도전하세요!',
        icon: Swords,
        href: '/superpet/dungeon',
        color: 'text-red-500',
    },
    {
        title: '룸',
        desc: '다른 반려동물 영웅들과 소통하세요.',
        icon: Users,
        href: '/superpet/room',
        color: 'text-emerald-500',
    },
];

export default function SuperpetHome() {
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState<PetInfo['type']>('dog');
    const [traits, setTraits] = useState<string[]>([]);
    const [character, setCharacter] = useState<Character | null>(null);

    const toggleTrait = (trait: string) => {
        setTraits((prev) =>
            prev.includes(trait)
                ? prev.filter((t) => t !== trait)
                : prev.length < 3 ? [...prev, trait] : prev
        );
    };

    const handleGenerate = () => {
        if (!petName.trim()) return;
        const char = generateCharacter(petName.trim(), petType, traits);
        setCharacter(char);
        localStorage.setItem('superpet-character', JSON.stringify(char));
    };

    return (
        <div className="relative overflow-hidden">
            {/* Hero */}
            <section className="py-16 bg-foreground/5 min-h-[80vh] flex items-center">
                <div className="max-w-3xl mx-auto px-4 w-full">
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter mb-4 uppercase"
                        >
                            SUPER <span className="text-amber-500">PET</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-foreground/60 text-xl"
                        >
                            내 반려동물을 슈퍼 영웅으로 만들어보세요!
                        </motion.p>
                    </div>

                    {/* 캐릭터 생성 폼 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-8 rounded-2xl shadow-lg bg-white/5 mb-8"
                    >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <PawPrint className="h-5 w-5 text-amber-500" />
                            캐릭터 생성
                        </h2>

                        {/* 펫 이름 */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                펫 이름
                            </label>
                            <input
                                type="text"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                                placeholder="반려동물 이름을 입력하세요"
                                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-amber-500 focus:outline-none transition-colors"
                                maxLength={20}
                            />
                        </div>

                        {/* 종류 선택 */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                종류
                            </label>
                            <div className="flex gap-3">
                                {PET_TYPES.map((pt) => (
                                    <button
                                        key={pt.key}
                                        onClick={() => setPetType(pt.key)}
                                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                                            petType === pt.key
                                                ? 'bg-amber-500 text-white shadow-lg'
                                                : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
                                        }`}
                                    >
                                        {pt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 특성 선택 */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                특성 선택 <span className="text-foreground/40 font-normal">(최대 3개)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PET_TRAITS.map((trait) => (
                                    <button
                                        key={trait}
                                        onClick={() => toggleTrait(trait)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            traits.includes(trait)
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
                                        }`}
                                    >
                                        {trait}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 생성 버튼 */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGenerate}
                            disabled={!petName.trim()}
                            className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Sparkles className="h-5 w-5" />
                            캐릭터 생성
                        </motion.button>
                    </motion.div>

                    {/* 캐릭터 결과 */}
                    <AnimatePresence>
                        {character && (
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="glass p-8 rounded-2xl shadow-lg bg-white/5 mb-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black">{character.name}</h3>
                                        <p className="text-foreground/60 text-sm">{character.className}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${ELEMENT_COLORS[character.element]}`}>
                                        {character.element}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {STAT_CONFIG.map((stat) => {
                                        const value = character[stat.key];
                                        const pct = Math.min((value / stat.max) * 100, 100);
                                        return (
                                            <div key={stat.key}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80">
                                                        <stat.icon className="h-4 w-4" />
                                                        {stat.label}
                                                    </span>
                                                    <span className="text-sm font-bold">{value}</span>
                                                </div>
                                                <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        className={`h-full rounded-full ${stat.color}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Link
                                    href="/superpet/dungeon"
                                    className="mt-6 w-full py-3 rounded-xl bg-red-500 text-white font-bold text-center flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                                >
                                    <Swords className="h-5 w-5" />
                                    던전 탐험하기
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* 퀵링크 */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass p-8 rounded-2xl group transition-all shadow-lg bg-white/5"
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
                                    className="text-sm font-bold flex items-center gap-1 hover:text-amber-500 transition-colors"
                                >
                                    자세히 보기 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
