'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Users, PawPrint, Shield, Zap, Heart, Gauge, Sparkles, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    generateCharacter,
    PET_TYPES,
    PET_TRAITS,
    loadAllCharacters,
    addCharacter,
    deleteCharacter,
    setActiveCharacter,
    migrateCharacterData,
    type Character,
    type PetInfo
} from './types';

const ELEMENT_COLORS: Record<string, string> = {
    '불': 'bg-red-500',
    '물': 'bg-blue-500',
    '풍': 'bg-emerald-500',
    '땅': 'bg-amber-600',
};

export default function SuperpetHome() {
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState<PetInfo['type']>('dog');
    const [traits, setTraits] = useState<string[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

    // 페이지 로드 시 기존 캐릭터 불러오기
    useEffect(() => {
        migrateCharacterData(); // 기존 데이터 마이그레이션
        const allChars = loadAllCharacters();
        setCharacters(allChars);

        // 활성 캐릭터 ID 로드
        const activeId = localStorage.getItem('superpet-active-character');
        setActiveCharacterId(activeId);

        if (allChars.length === 0) {
            setShowForm(true); // 캐릭터가 없으면 폼 표시
        }
    }, []);

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
        const success = addCharacter(char);
        if (success) {
            setCharacters(loadAllCharacters());
            setPetName('');
            setTraits([]);
            setShowForm(false);
        }
    };

    const handleSelectCharacter = (characterId: string) => {
        setActiveCharacter(characterId);
        setActiveCharacterId(characterId);
    };

    const handleDeleteCharacter = (characterId: string) => {
        deleteCharacter(characterId);
        setCharacters(loadAllCharacters());
        setDeleteConfirm(null);
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

                    {/* 캐릭터 카드 그리드 */}
                    {characters.length > 0 && !showForm && (
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {characters.map((char, idx) => (
                                    <motion.div
                                        key={char.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass p-6 rounded-2xl shadow-lg bg-white/5 relative group"
                                    >
                                        {/* 삭제 버튼 */}
                                        <button
                                            onClick={() => setDeleteConfirm(char.id)}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <div className="text-center mb-4">
                                            <h3 className="text-xl font-black mb-1">{char.name}</h3>
                                            <p className="text-foreground/60 text-sm mb-2">
                                                {char.className} | LV.{char.level}
                                            </p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-bold ${ELEMENT_COLORS[char.element]}`}>
                                                {char.element}
                                            </span>
                                        </div>

                                        {/* HP 바 */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-foreground/60">HP</span>
                                                <span className="text-xs font-bold">{char.currentHp} / {char.hp}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                                                <div
                                                    style={{ width: `${Math.max((char.currentHp / char.hp) * 100, 0)}%` }}
                                                    className="h-full rounded-full bg-red-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* 선택 버튼 */}
                                        {activeCharacterId === char.id ? (
                                            <div className="w-full py-2.5 rounded-lg bg-foreground/10 text-foreground/50 text-sm font-bold text-center flex items-center justify-center gap-2 cursor-not-allowed">
                                                <PawPrint className="h-4 w-4" />
                                                선택됨
                                            </div>
                                        ) : (
                                            <Link
                                                href="/superpet/dungeon"
                                                onClick={() => handleSelectCharacter(char.id)}
                                                className="w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold text-center hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <PawPrint className="h-4 w-4" />
                                                선택
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}

                                {/* 새 캐릭터 추가 카드 */}
                                {characters.length < 3 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: characters.length * 0.1 }}
                                        onClick={() => setShowForm(true)}
                                        className="glass p-6 rounded-2xl shadow-lg bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-foreground/20"
                                    >
                                        <Plus className="h-12 w-12 text-amber-500 mb-3" />
                                        <span className="text-sm font-bold text-foreground/60">새 캐릭터 만들기</span>
                                        <span className="text-xs text-foreground/40 mt-1">({characters.length}/3)</span>
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 캐릭터 생성 폼 */}
                    {showForm && (
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
                                            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${petType === pt.key
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
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${traits.includes(trait)
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

                            {/* 취소 버튼 */}
                            {characters.length > 0 && (
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="mt-3 w-full py-2 text-sm text-foreground/60 hover:text-foreground/80 transition-colors"
                                >
                                    취소
                                </button>
                            )}
                        </motion.div>
                    )}

                </div>
            </section>

            {/* 삭제 확인 모달 */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-red-500"
                        >
                            <div className="text-center mb-6">
                                <Trash2 className="h-16 w-16 text-red-500 mx-auto mb-3" />
                                <h3 className="text-xl font-black mb-2">캐릭터 삭제</h3>
                                <p className="text-sm text-foreground/60">
                                    정말로 이 캐릭터를 삭제하시겠습니까?<br />
                                    이 작업은 되돌릴 수 없습니다.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => handleDeleteCharacter(deleteConfirm)}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
