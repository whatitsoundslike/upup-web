'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Swords, PawPrint, Shield, Heart, Sparkles, Plus, Trash2, Sword, Feather, Camera, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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
import { getItem, setItem } from './storage';
import { useLanguage } from './i18n/LanguageContext';

const ELEMENT_COLORS: Record<string, string> = {
    '불': 'bg-red-500',
    '물': 'bg-blue-500',
    '풍': 'bg-emerald-500',
    '땅': 'bg-amber-600',
};

export default function SuperpetHome() {
    const { t, lang } = useLanguage();
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState<PetInfo['type']>('dog');
    const [traits, setTraits] = useState<string[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
    const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [petPhoto, setPetPhoto] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateProgress, setGenerateProgress] = useState(0);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    // 페이지 로드 시 기존 캐릭터 불러오기
    useEffect(() => {
        migrateCharacterData(); // 기존 데이터 마이그레이션
        const allChars = loadAllCharacters();
        setCharacters(allChars);

        // 활성 캐릭터 ID 로드
        const activeId = getItem('active-character');
        setActiveCharacterId(activeId);

        if (allChars.length === 0) {
            setShowForm(true); // 캐릭터가 없으면 폼 표시
        }

        // 하루 1회 안내 모달
        const today = new Date().toISOString().slice(0, 10);
        const lastShown = getItem('announcement-shown');
        if (lastShown !== today) {
            setShowAnnouncement(true);
        }

        // Navbar에서 공지 다시보기 이벤트 수신
        const handleShowAnnouncement = () => setShowAnnouncement(true);
        window.addEventListener('superpet-show-announcement', handleShowAnnouncement);
        return () => window.removeEventListener('superpet-show-announcement', handleShowAnnouncement);
    }, []);

    // 캐릭터 생성 시 상단으로 스크롤
    useEffect(() => {
        if (createdCharacter) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [createdCharacter]);

    // 생성 중 프로그레스바 시뮬레이션
    useEffect(() => {
        if (!isGenerating) {
            setGenerateProgress(0);
            return;
        }
        setGenerateProgress(0);
        const interval = setInterval(() => {
            setGenerateProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 8 + 2;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isGenerating]);

    const toggleTrait = (trait: string) => {
        setTraits((prev) =>
            prev.includes(trait)
                ? prev.filter((t) => t !== trait)
                : prev.length < 3 ? [...prev, trait] : prev
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setGenerateError(null);
        const reader = new FileReader();
        reader.onload = () => setPetPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!petName.trim() || traits.length < 3) return;
        setGenerateError(null);

        let cardImage: string | undefined;

        if (petPhoto) {
            setIsGenerating(true);
            try {
                const res = await fetch('/api/superpet/generate-card', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: petPhoto }),
                });
                const data = await res.json();
                if (!data.success) {
                    setGenerateError(data.error || t('카드 생성에 실패했습니다'));
                    setIsGenerating(false);
                    return;
                }
                cardImage = data.cardImage;
            } catch {
                setGenerateError(t('카드 생성에 실패했습니다'));
                setIsGenerating(false);
                return;
            }
            setIsGenerating(false);
        }

        const char = generateCharacter(petName.trim(), petType, traits, cardImage);
        const success = addCharacter(char);
        if (success) {
            setCharacters(loadAllCharacters());
            setPetName('');
            setTraits([]);
            setPetPhoto(null);
            setShowForm(false);
            setCreatedCharacter(char);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSelectCharacter = (characterId: string) => {
        setActiveCharacter(characterId);
        setActiveCharacterId(characterId);
    };

    const handleCloseAnnouncement = () => {
        setShowAnnouncement(false);
        const today = new Date().toISOString().slice(0, 10);
        setItem('announcement-shown', today);
    };

    const handleShare = async () => {
        if (!createdCharacter || isSharing) return;
        setIsSharing(true);

        // 트위터 창을 먼저 열어서 팝업 차단 방지 (사용자 클릭 컨텍스트 내에서)
        const tweetText = lang === 'ko'
            ? `🐾 내 슈퍼펫 「${createdCharacter.name}」을(를) 소개합니다!\n#SuperPet #슈퍼펫`
            : `🐾 Meet my Super Pet "${createdCharacter.name}"!\n#SuperPet`;
        const tweetUrl = 'https://zroom.io/superpet';
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`,
            '_blank',
            'noopener,noreferrer'
        );

        setIsSharing(false);
    };

    const handleDeleteCharacter = (characterId: string) => {
        deleteCharacter(characterId);
        const remaining = loadAllCharacters();
        setCharacters(remaining);
        setDeleteConfirm(null);
        if (remaining.length === 0) {
            setActiveCharacterId(null);
            setShowForm(true);
        }
    };

    return (
        <div className="relative overflow-hidden">
            {/* Hero */}
            <section className="py-2 bg-foreground/5 min-h-[80vh] flex items-center">
                <div className="max-w-3xl mx-auto px-4 w-full">

                    {/* 홈 로고 영역 */}
                    {!createdCharacter && (
                        <div>
                            <div className="text-center mb-4">
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl font-black tracking-tighter mb-4 uppercase"
                                >
                                    SUPER <span className="text-amber-500">PET</span> <span className="text-blue-500 text-[20px]">[Beta]</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-foreground/60 text-xl"
                                >
                                    <img className='w-full' src="/superpet_thumbnail.webp" alt="logo" />
                                </motion.p>
                            </div>
                            <div className="text-center mb-4 text-blue-500">{t('본 게임은 베타서비스 중입니다.')}</div>
                        </div>
                    )}


                    {/* 캐릭터 생성 결과 */}
                    {createdCharacter && !showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-8 rounded-2xl shadow-lg bg-white/5 mb-8"
                        >
                            <div className="p-4">
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                        className="mb-4"
                                    >
                                        {createdCharacter.image ? (
                                            <img src={createdCharacter.image} alt={createdCharacter.name} className="w-50 h-80 object-cover rounded-2xl mx-auto shadow-lg border-2 border-amber-500" />
                                        ) : (
                                            <span className="text-6xl">🐾</span>
                                        )}
                                    </motion.div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-black mb-2"
                                    >
                                        {createdCharacter.name}
                                    </motion.h2>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                                            Lv.{createdCharacter.level}
                                        </span>
                                        <span className="text-foreground/60 text-sm font-semibold">{t(createdCharacter.className)}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-white text-xs font-bold ${ELEMENT_COLORS[createdCharacter.element]}`}>
                                            {t(createdCharacter.element)}
                                        </span>
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.45 }}
                                        className="text-foreground/60 text-sm mt-3"
                                    >
                                        {lang === 'ko'
                                            ? <>반가워, <span className="font-bold text-foreground">{createdCharacter.name}</span>! 정말 멋진 모험가가 탄생했어!</>
                                            : <>Welcome, <span className="font-bold text-foreground">{createdCharacter.name}</span>! {t('정말 멋진 모험가가 탄생했어!')}</>
                                        }
                                    </motion.p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid grid-cols-2 gap-3 mb-6"
                                >
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10">
                                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                        <span className="text-sm text-foreground/70">HP</span>
                                        <span className="ml-auto font-bold">{createdCharacter.hp}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10">
                                        <Sword className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-foreground/70">{t('공격')}</span>
                                        <span className="ml-auto font-bold">{createdCharacter.attack}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10">
                                        <Shield className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-foreground/70">{t('방어')}</span>
                                        <span className="ml-auto font-bold">{createdCharacter.defense}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10">
                                        <Feather className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-foreground/70">{t('속도')}</span>
                                        <span className="ml-auto font-bold">{createdCharacter.speed}</span>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col gap-3"
                            >
                                <Link
                                    href="/superpet/dungeon"
                                    onClick={() => {
                                        handleSelectCharacter(createdCharacter.id);
                                        setCreatedCharacter(null);
                                    }}
                                    className="w-full py-4 rounded-xl bg-red-500 text-white font-bold text-lg shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Swords className="h-5 w-5" />
                                    {t('모험 시작하기')}
                                </Link>
                                <button
                                    onClick={handleShare}
                                    disabled={isSharing}
                                    className="w-full py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {isSharing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    )}
                                    {t('트위터에 슈퍼펫 알려주기')}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* 캐릭터 카드 그리드 */}
                    {characters.length > 0 && !showForm && !createdCharacter && (
                        <div className="mb-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                {characters.map((char, idx) => (
                                    <motion.div
                                        key={char.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-6 rounded-2xl shadow-lg backdrop-blur-md relative group ${activeCharacterId === char.id
                                            ? 'bg-amber-500/10 border-2 border-amber-500 ring-2 ring-amber-500/20'
                                            : 'bg-white/5 border border-foreground/20'
                                            }`}
                                    >
                                        {/* 삭제 버튼 */}
                                        <button
                                            onClick={() => setDeleteConfirm(char.id)}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        {char.image && (
                                            <div className="mb-3">
                                                <img src={char.image} alt={char.name} className="w-full h-full object-cover rounded-xl" />
                                            </div>
                                        )}
                                        <div className="text-center mb-4">
                                            <h3 className="text-xl font-black mb-1">{char.name}</h3>
                                            <p className="text-foreground/60 text-sm mb-2">
                                                {t(char.className)} | LV.{char.level}
                                            </p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-bold ${ELEMENT_COLORS[char.element]}`}>
                                                {t(char.element)}
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
                                            <div className="flex flex-col gap-2">
                                                <div className="w-full py-2.5 rounded-lg bg-foreground/10 text-foreground/50 text-sm font-bold text-center flex items-center justify-center gap-2 cursor-not-allowed">
                                                    <PawPrint className="h-4 w-4" />
                                                    {t('선택됨')}
                                                </div>
                                                <Link
                                                    href="/superpet/dungeon"
                                                    className="w-full py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold text-center hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Swords className="h-4 w-4" />
                                                    {t('던전 가기')}
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href="/superpet/dungeon"
                                                onClick={() => handleSelectCharacter(char.id)}
                                                className="w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold text-center hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <PawPrint className="h-4 w-4" />
                                                {t('선택')}
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
                                        <span className="text-sm font-bold text-foreground/60">{t('새 캐릭터 만들기')}</span>
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
                                {t('캐릭터 생성')}
                            </h2>

                            {/* 펫 이름 */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                    {t('펫 이름')}
                                </label>
                                <input
                                    type="text"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    placeholder={t('반려동물 이름을 입력하세요')}
                                    className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus:border-amber-500 focus:outline-none transition-colors"
                                    maxLength={20}
                                />
                            </div>

                            {/* 종류 선택 */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                    {t('종류')}
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
                                            {t(pt.label)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 특성 선택 */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                    {t('특성 선택')} <span className="text-foreground/40 font-normal">({traits.length}/3)</span>
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
                                            {t(trait)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 사진 업로드 (필수) */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                    {t('반려동물 사진')} <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-foreground/40 mb-3">{t('사진을 첨부하면 AI가 카드로 변환합니다')}</p>
                                {petPhoto ? (
                                    <div className="relative inline-block">
                                        <img src={petPhoto} alt="pet" className="w-32 h-32 object-cover rounded-xl border border-foreground/10" />
                                        <button
                                            onClick={() => { setPetPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-foreground/5 border border-dashed border-foreground/20 hover:bg-foreground/10 transition-colors text-foreground/50 text-sm"
                                    >
                                        <Camera className="h-5 w-5" />
                                        {t('사진 첨부하기')}
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>

                            {/* 에러 메시지 */}
                            {generateError && (
                                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                    {generateError}
                                </div>
                            )}

                            {/* 생성 버튼 / 프로그레스바 */}
                            {isGenerating ? (
                                <div className="w-full rounded-xl bg-foreground/5 border border-foreground/10 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-foreground/70 flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                                            {t('멋진 캐릭터 카드를 생성 중입니다...')}
                                        </span>
                                        <span className="text-xs font-bold text-amber-500">{Math.round(generateProgress)}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${generateProgress}%` }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={!petName.trim() || traits.length < 3 || !petPhoto}
                                    className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    {t('캐릭터 생성')}
                                </motion.button>
                            )}

                            {/* 취소 버튼 */}
                            {characters.length > 0 && (
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="mt-3 w-full py-2 text-sm text-foreground/60 hover:text-foreground/80 transition-colors"
                                >
                                    {t('취소')}
                                </button>
                            )}
                        </motion.div>
                    )}

                </div>
            </section>

            {/* 안내 모달 */}
            <AnimatePresence>
                {showAnnouncement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={handleCloseAnnouncement}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                        >
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">🏆</div>
                                <h3 className="text-xl font-black mb-3">{t('시즌 안내')}</h3>
                                <p className="text-sm text-foreground/70 leading-relaxed">
                                    {t('이 게임은 시즌제로 운영되며 시즌 종료시의 게임 데이터는 명예의 전당에 기록됩니다.')}<br /><br />
                                    {t('매주 새로운 시즌이 시작됩니다.')}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseAnnouncement}
                                className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                <h3 className="text-xl font-black mb-2">{t('캐릭터 삭제')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {t('정말로 이 캐릭터를 삭제하시겠습니까?')}<br />
                                    {t('이 작업은 되돌릴 수 없습니다.')}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 rounded-xl bg-foreground/10 text-foreground/60 font-bold hover:bg-foreground/20 transition-colors"
                                >
                                    {t('취소')}
                                </button>
                                <button
                                    onClick={() => handleDeleteCharacter(deleteConfirm)}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    {t('삭제')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
