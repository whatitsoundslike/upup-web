'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Feather, Gem, Heart, Loader2, LogIn, Mars, PawPrint, Plus, Rocket, Shield, Sparkles, Sword, Swords, Trash2, Venus, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { getItem, setItem } from './storage';
import {
    addCharacter,
    deleteCharacter,
    generateCharacter,
    loadAllCharacters,
    migrateCharacterData,
    PET_TRAITS,
    PET_TYPES,
    setActiveCharacter,
    getTotalStats,
    type Character,
    type PetInfo
} from './types';
import { saveToServer } from './gameSync';
import { fetchGemBalance, useGem } from './gemApi';
import ProgressModal from './components/ProgressModal';

const DELETE_GEM_COST = 100;

const ELEMENT_COLORS: Record<string, string> = {
    '불': 'bg-red-500',
    '물': 'bg-blue-500',
    '풍': 'bg-emerald-500',
    '땅': 'bg-amber-600',
};

export default function SuperpetHome() {
    const { t, lang } = useLanguage();
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState<PetInfo['type'] | null>(null);
    const [cardStyle, setCardStyle] = useState<'cute' | 'powerful' | 'furry' | null>(null);
    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [traits, setTraits] = useState<string[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
    const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [petPhoto, setPetPhoto] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [fileSizeError, setFileSizeError] = useState<{ show: boolean; size: number }>({ show: false, size: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    // Gem 상태
    const [gemBalance, setGemBalance] = useState<number | null>(null);
    const [gemLoading, setGemLoading] = useState(false);
    const [showInsufficientGem, setShowInsufficientGem] = useState(false);

    // 카드 생성 실패 모달
    const [cardGenerateFailModal, setCardGenerateFailModal] = useState<{ show: boolean; petName: string }>({ show: false, petName: '' });

    // 시작 선택 화면 (로그인/새로 시작)
    const [showStartChoice, setShowStartChoice] = useState(false);

    // 페이지 로드 시 기존 캐릭터 불러오기
    useEffect(() => {
        migrateCharacterData(); // 기존 데이터 마이그레이션
        const allChars = loadAllCharacters();
        setCharacters(allChars);

        // 활성 캐릭터 ID 로드
        const activeId = getItem('active-character');
        setActiveCharacterId(activeId);

        if (allChars.length === 0) {
            setShowStartChoice(true); // 캐릭터가 없으면 시작 선택 화면 표시
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

    // Gem 잔액 로드
    useEffect(() => {
        const loadGem = async () => {
            const data = await fetchGemBalance();
            if (data) {
                setGemBalance(data.balance);
            }
        };
        loadGem();
    }, []);

    const toggleTrait = (trait: string) => {
        setTraits((prev) =>
            prev.includes(trait)
                ? prev.filter((t) => t !== trait)
                : prev.length < 3 ? [...prev, trait] : prev
        );
    };

    const MAX_FILE_SIZE = 750 * 1024; // 750KB

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setGenerateError(null);

        // 파일 크기 체크
        if (file.size > MAX_FILE_SIZE) {
            setFileSizeError({ show: true, size: file.size });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setPetPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!petName.trim() || !petType || traits.length < 3 || !petPhoto || !cardStyle || !gender) return;
        setGenerateError(null);

        const charName = petName.trim();

        // 프로그레스 모달 표시
        setProgressMessage(t('멋진 캐릭터 카드를 생성 중입니다...'));
        setIsGenerating(true);

        // 1단계: 카드 이미지 생성 먼저
        let cardImage: string | null = null;
        const char = generateCharacter(charName, petType, traits);

        try {
            const res = await fetch('/api/superpet/generate-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: petPhoto,
                    name: char.name,
                    className: char.className,
                    element: char.element,
                    style: cardStyle,
                    gender: gender,
                    characterId: char.id,
                }),
            });
            const data = await res.json();
            if (data.success && data.cardImage) {
                cardImage = data.cardImage;
            } else {
                // 카드 생성 실패 - 모달 표시하고 중단
                setIsGenerating(false);
                setCardGenerateFailModal({ show: true, petName: charName });
                return;
            }
        } catch {
            // 카드 생성 실패 - 모달 표시하고 중단
            setIsGenerating(false);
            setCardGenerateFailModal({ show: true, petName: charName });
            return;
        }

        // 2단계: 카드 생성 성공 시 캐릭터 저장
        char.image = cardImage ?? undefined;
        const success = addCharacter(char);
        if (!success) {
            setIsGenerating(false);
            return;
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        setPetPhoto(null);

        // 3단계: 서버 저장
        setProgressMessage(t('데이터를 저장하고 있습니다...'));
        await saveToServer();

        setIsGenerating(false);
        setCharacters(loadAllCharacters());
        setPetName('');
        setPetType(null);
        setTraits([]);
        setCardStyle(null);
        setGender(null);
        setShowForm(false);
        setCreatedCharacter(char);
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

    const handleDeleteCharacter = async (characterId: string) => {
        // Gem 잔액 확인
        if (gemBalance === null || gemBalance < DELETE_GEM_COST) {
            setDeleteConfirm(null);
            setShowInsufficientGem(true);
            return;
        }

        // Gem 소모 API 호출
        setGemLoading(true);
        const result = await useGem(DELETE_GEM_COST, 'delete_character', `캐릭터 삭제: ${characterId}`);
        setGemLoading(false);

        if (!result.success) {
            setDeleteConfirm(null);
            setShowInsufficientGem(true);
            return;
        }

        // Gem 잔액 업데이트
        if (result.balance !== undefined) {
            setGemBalance(result.balance);
        }

        // 캐릭터 삭제 진행
        deleteCharacter(characterId);
        const remaining = loadAllCharacters();
        setCharacters(remaining);
        setDeleteConfirm(null);
        saveToServer();
        if (remaining.length === 0) {
            setActiveCharacterId(null);
            setShowForm(true);
        }
    };

    return (
        <div className="relative overflow-hidden">
            {/* Hero */}
            <section className="py-2 bg-foreground/5 min-h-[80vh] flex items-center">
                <div className="max-w-2xl mx-auto px-4 w-full">

                    {/* 홈 로고 영역 */}
                    {!createdCharacter && characters.length === 0 && !showForm && (
                        <div className="flex flex-col items-center">
                            <div className="text-center mb-4">
                                <motion.p
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-foreground/60 text-xl"
                                >
                                    <img className='w-full' src="/superpet_thumbnail.webp" alt="logo" />
                                </motion.p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowAnnouncement(true)}
                        className="group relative w-[220px] mx-auto py-3 px-6 rounded-lg bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-white font-black text-base border-2transition-all mb-6 flex items-center justify-center gap-2 overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="text-xl animate-bounce">📢</span>
                        <span className="drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]">{t('공지사항')}</span>
                    </button>

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
                                            <img src={createdCharacter.image} alt={createdCharacter.name} className="w-45 h-80 object-cover rounded-2xl mx-auto shadow-lg border-2 border-amber-500" />
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

                    {/* 시작 선택 화면 */}
                    {showStartChoice && !showForm && !createdCharacter && characters.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-2xl shadow-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border-2 border-amber-500/30 backdrop-blur-sm text-center"
                        >
                            <div className="text-6xl mb-6">🐾</div>
                            <h2 className="text-2xl font-black mb-3 text-amber-400">
                                {t('슈퍼펫에 오신 것을 환영합니다!')}
                            </h2>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/login?callbackUrl=/superpet"
                                    className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogIn className="h-5 w-5" />
                                    {t('로그인하기')}
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowStartChoice(false);
                                        setShowForm(true);
                                    }}
                                    className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Rocket className="h-5 w-5" />
                                    {t('새로 시작하기')}
                                </button>
                            </div>
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
                                        {(() => {
                                            const stats = getTotalStats(char);
                                            return (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-foreground/60">{t('HP')}</span>
                                                        <span className="text-xs font-bold">{char.currentHp} / {stats.hp}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                                                        <div
                                                            style={{ width: `${Math.max((char.currentHp / stats.hp) * 100, 0)}%` }}
                                                            className="h-full rounded-full bg-red-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}

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
                                                <button
                                                    onClick={() => setDeleteConfirm(char.id)}
                                                    className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-bold text-center hover:bg-red-500/20 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t('삭제')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    href="/superpet/dungeon"
                                                    onClick={() => handleSelectCharacter(char.id)}
                                                    className="w-full py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold text-center hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <PawPrint className="h-4 w-4" />
                                                    {t('선택')}
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(char.id)}
                                                    className="w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-bold text-center hover:bg-red-500/20 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t('삭제')}
                                                </button>
                                            </div>
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
                            className="p-6 rounded-xl shadow-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 mb-8 border-2 border-amber-500/30 backdrop-blur-sm"
                        >
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                                <PawPrint className="h-7 w-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                                {t('캐릭터 생성')}
                            </h2>

                            {/* 펫 이름 */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                    📝 {t('펫 이름')}
                                </label>
                                <input
                                    type="text"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    placeholder={t('반려동물 이름을 입력하세요')}
                                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border-2 border-zinc-600 focus:border-amber-500 focus:shadow-[0_0_12px_rgba(251,191,36,0.4)] focus:outline-none transition-all text-white placeholder:text-zinc-500 font-semibold"
                                    maxLength={20}
                                />
                            </div>

                            {/* 종류 선택 - 이름 입력 후 표시 */}
                            <AnimatePresence>
                                {petName.trim() && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 overflow-hidden"
                                    >
                                        <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                            ⚔️ {t('종류')}
                                        </label>
                                        <div className="flex gap-2">
                                            {PET_TYPES.map((pt) => (
                                                <button
                                                    key={pt.key}
                                                    onClick={() => setPetType(pt.key)}
                                                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${petType === pt.key
                                                        ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                        : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                        }`}
                                                >
                                                    {t(pt.label)}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 카드 스타일 선택 - 종류 선택 후 표시 */}
                            <AnimatePresence>
                                {petType && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 overflow-hidden"
                                    >
                                        <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                            🎨 {t('카드 스타일')}
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCardStyle('furry')}
                                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${cardStyle === 'furry'
                                                    ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                    : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                    }`}
                                            >
                                                🐶 {t('멋진')}
                                            </button>
                                            <button
                                                onClick={() => setCardStyle('cute')}
                                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${cardStyle === 'cute'
                                                    ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white border-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                    : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                    }`}
                                            >
                                                ♥️ {t('귀여운')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 성별 선택 - 카드 스타일 선택 후 표시 */}
                            <AnimatePresence>
                                {cardStyle && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 overflow-hidden"
                                    >
                                        <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                            👤 {t('성별')}
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setGender('male')}
                                                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border-2 ${gender === 'male'
                                                    ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                    : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                    }`}
                                            >
                                                <Mars className="h-6 w-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                            </button>
                                            <button
                                                onClick={() => setGender('female')}
                                                className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border-2 ${gender === 'female'
                                                    ? 'bg-gradient-to-b from-pink-400 to-pink-600 text-white border-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                    : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                    }`}
                                            >
                                                <Venus className="h-6 w-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 특성 선택 - 성별 선택 후 표시 */}
                            <AnimatePresence>
                                {gender && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                            ✨ {t('특성 선택')} <span className="text-emerald-400 font-normal">({traits.length}/3)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {PET_TRAITS.map((trait) => (
                                                <button
                                                    key={trait}
                                                    onClick={() => toggleTrait(trait)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${traits.includes(trait)
                                                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] scale-105'
                                                        : 'bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:border-zinc-500 hover:text-white'
                                                        }`}
                                                >
                                                    {t(trait)}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 사진 업로드 - 특성 3개 선택 후 표시 */}
                            <AnimatePresence>
                                {traits.length >= 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <label className="block text-sm font-semibold mb-2 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">
                                            📷 {t('반려동물 사진')}
                                        </label>
                                        <p className="text-xs text-zinc-400 mb-3">{t('사진을 첨부하면 AI가 카드로 변환합니다')}</p>
                                        {petPhoto ? (
                                            <div className="relative inline-block">
                                                <img src={petPhoto} alt="pet" className="w-32 h-32 object-cover rounded-lg border-2 border-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
                                                <button
                                                    onClick={() => { setPetPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_0_8px_rgba(239,68,68,0.6)] hover:from-red-400 hover:to-red-600 transition-all border border-red-400"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-3 px-5 py-4 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-800 border-2 border-dashed border-zinc-500 hover:border-amber-500 hover:from-zinc-600 hover:to-zinc-700 transition-all text-zinc-300 hover:text-amber-400 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)]"
                                            >
                                                <Camera className="h-5 w-5" />
                                                {t('사진 첨부하기')}
                                                <span className="text-xs text-zinc-500">({t('최대 750KB')})</span>
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 에러 메시지 */}
                            {generateError && (
                                <div className="mb-4 p-3 rounded-lg bg-gradient-to-b from-red-900/50 to-red-950/50 border-2 border-red-500/50 text-red-400 text-sm text-center font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                                    ⚠️ {generateError}
                                </div>
                            )}

                            {/* 생성 버튼 - 모든 옵션 선택 완료 시 표시 */}
                            <AnimatePresence>
                                {petName.trim() && petType && cardStyle && gender && traits.length >= 3 && petPhoto && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="w-full py-4 rounded-lg bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-white font-black text-lg border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5),inset_0_1px_0_rgba(255,255,255,0.3),0_4px_0_#b45309] hover:shadow-[0_0_30px_rgba(251,191,36,0.7),inset_0_1px_0_rgba(255,255,255,0.3),0_4px_0_#b45309] active:shadow-[0_0_15px_rgba(251,191,36,0.4),inset_0_1px_0_rgba(255,255,255,0.3),0_2px_0_#b45309] active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 tracking-wide"
                                        >
                                            <Sparkles className="h-6 w-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                            {t('캐릭터 생성')}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 취소 버튼 */}
                            {characters.length > 0 && (
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="mt-3 w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-400 border-2 border-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] hover:from-zinc-600 hover:to-zinc-700 hover:text-zinc-300 hover:border-zinc-500 transition-all"
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
                                <p className="text-sm text-foreground/70 leading-relaxed text-left">
                                    - {t('이 게임은 시즌제로 운영되며 시즌 종료시의 게임 데이터는 명예의 전당에 기록됩니다.')}<br />
                                    - {t('매주 새로운 시즌이 시작됩니다.')}<br />
                                    - {t('캐릭터 저장 기능이 추가되었습니다!')} (2026.02.03)<br />
                                    - {t('랭킹 기능이 추가되었습니다!')} (2026.02.03)
                                    - {t('무료 사료 배달 기능이 추가되었습니다! 웹 접속시 30분 마다 사료가 지급됩니다.')} (2026.02.03)<br />
                                    - {t('캐릭터 생성시 성별을 선택할 수 있습니다.')} (2026.02.06)<br />
                                    - {t('강화 시스템이 추가되었습니다!')} (2026.02.06)<br />

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

            {/* 프로그레스 모달 */}
            <ProgressModal isOpen={isGenerating} message={progressMessage} />

            {/* 파일 용량 초과 모달 */}
            <AnimatePresence>
                {fileSizeError.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setFileSizeError({ show: false, size: 0 })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                        >
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">📁</div>
                                <h3 className="text-xl font-black mb-2">{t('파일 용량 초과')}</h3>
                                <p className="text-sm text-foreground/60 mb-3">
                                    {t('업로드 가능한 최대 파일 크기는 750KB입니다.')}<br />
                                    {t('더 작은 용량의 이미지를 선택해주세요.')}
                                </p>
                                <p className="text-xs text-foreground/40">
                                    {t('현재 파일 크기')}: {(fileSizeError.size / 1024).toFixed(1)}KB
                                </p>
                            </div>
                            <button
                                onClick={() => setFileSizeError({ show: false, size: 0 })}
                                className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 카드 생성 실패 모달 */}
            <AnimatePresence>
                {cardGenerateFailModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setCardGenerateFailModal({ show: false, petName: '' })}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-amber-500"
                        >
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">😢</div>
                                <h3 className="text-xl font-black mb-2">{t('카드 생성 실패')}</h3>
                                <p className="text-sm text-foreground/60">
                                    {lang === 'ko'
                                        ? `요청이 많아 '${cardGenerateFailModal.petName}'의 게임카드를 생성하지 못했어요. 잠시 후 다시 시도해주세요.`
                                        : `Due to high demand, we couldn't generate a game card for '${cardGenerateFailModal.petName}'. Please try again later.`}
                                </p>
                            </div>
                            <button
                                onClick={() => setCardGenerateFailModal({ show: false, petName: '' })}
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
                                <p className="text-sm text-foreground/60 mb-3">
                                    {t('정말로 이 캐릭터를 삭제하시겠습니까?')}<br />
                                    {t('이 작업은 되돌릴 수 없습니다.')}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Gem className="h-4 w-4" />
                                    <span className="font-bold">{DELETE_GEM_COST}</span>
                                    <span className="text-xs text-purple-400">{t('젬 필요')}</span>
                                </div>
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
                                    disabled={gemLoading}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {gemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {t('삭제')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 젬 부족 모달 */}
            <AnimatePresence>
                {showInsufficientGem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowInsufficientGem(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-purple-500"
                        >
                            <div className="text-center mb-6">
                                <Gem className="h-16 w-16 text-purple-500 mx-auto mb-3" />
                                <h3 className="text-xl font-black mb-2">{t('젬 부족')}</h3>
                                <p className="text-sm text-foreground/60 mb-3">
                                    {t('캐릭터 삭제에는')} <span className="font-bold text-purple-500">{DELETE_GEM_COST} {t('젬')}</span>{t('이 필요합니다.')}<br />
                                    {t('현재 보유')}: <span className="font-bold text-purple-500">{gemBalance ?? 0} {t('젬')}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInsufficientGem(false)}
                                className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors"
                            >
                                {t('확인')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
