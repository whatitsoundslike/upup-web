'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, ArrowLeft, ShoppingBag, MessageSquare, ExternalLink, Lock, LogIn, UserPlus, Plus, Pencil, Trash2, Save, Settings, ImagePlus, Copy, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import Room from './Room';
import RoomFloatingButtons from './RoomFloatingButtons';
import { useAuth } from '@/components/AuthProvider';
import DatePicker from '@/components/ui/DatePicker';

interface Item {
    id: string;
    name: string | null;
    description: string | null;
    images: string[];
    sale: boolean;
    price: string;
    buyUrl: string | null;
    purchasedAt: string | null;
    createdAt: string;
}

interface Record {
    id: string;
    text: string | null;
    images: string[];
    createdAt: string;
}

interface Room {
    id: string;
    name: string | null;
    description: string | null;
    category: string;
    images: string[];
    isLocked: boolean;
    items: Item[];
    records: Record[];
    member: { id: string; name: string | null; email: string | null };
}

interface RoomKeyData {
    id: string;
    code: string;
    createdAt: string;
    _count: { registrations: number };
}

interface RoomDetailClientProps {
    roomId: string;
    category: string;
}

export default function RoomDetailClient({ roomId, category }: RoomDetailClientProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrb, setSelectedOrb] = useState<{ type: 'item' | 'record'; data: Item | Record } | null>(null);
    const [autoSelectDone, setAutoSelectDone] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // 수정 폼 상태
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editBuyUrl, setEditBuyUrl] = useState('');
    const [editSale, setEditSale] = useState(false);
    const [editText, setEditText] = useState('');
    const [editImages, setEditImages] = useState<string[]>(['']);
    const [editPurchasedAt, setEditPurchasedAt] = useState('');

    // 룸 수정 상태
    const [isEditingRoom, setIsEditingRoom] = useState(false);
    const [editRoomName, setEditRoomName] = useState('');
    const [editRoomDescription, setEditRoomDescription] = useState('');
    const [editIsLocked, setEditIsLocked] = useState(false);
    const [savingRoom, setSavingRoom] = useState(false);

    // 룸 키 상태
    const [roomKeys, setRoomKeys] = useState<RoomKeyData[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [creatingKey, setCreatingKey] = useState(false);

    const isOwner = user && room && user.id === room.member.id;

    const fetchRoom = useCallback(async () => {
        try {
            const res = await fetch(`/api/rooms/${roomId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('룸을 찾을 수 없습니다.');
                }
                if (res.status === 403) {
                    const data = await res.json();
                    throw new Error(data.error || '이 룸은 잠겨있습니다. 룸 키가 필요합니다.');
                }
                throw new Error('룸을 불러오는데 실패했습니다.');
            }
            const data = await res.json();
            setRoom(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    const fetchRoomKeys = useCallback(async (id: string) => {
        setLoadingKeys(true);
        try {
            const res = await fetch(`/api/rooms/${id}/keys`);
            if (res.ok) {
                const data = await res.json();
                setRoomKeys(data);
            }
        } catch { /* ignore */ } finally {
            setLoadingKeys(false);
        }
    }, []);

    const handleCreateKey = useCallback(async () => {
        if (!room) return;
        setCreatingKey(true);
        try {
            const res = await fetch(`/api/rooms/${room.id}/keys`, { method: 'POST' });
            if (!res.ok) throw new Error('키 생성에 실패했습니다.');
            await fetchRoomKeys(room.id);
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setCreatingKey(false);
        }
    }, [room, fetchRoomKeys]);

    const handleDeleteKey = useCallback(async (keyId: string) => {
        if (!room || !confirm('이 키를 삭제하시겠습니까? 등록된 사용자의 접근이 해제됩니다.')) return;
        try {
            const res = await fetch(`/api/rooms/keys/${keyId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('키 삭제에 실패했습니다.');
            await fetchRoomKeys(room.id);
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        }
    }, [room, fetchRoomKeys]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchRoom();
        }
    }, [fetchRoom, authLoading, user]);

    // 모달 열림 시 배경 스크롤 잠금
    useEffect(() => {
        if (selectedOrb || isEditingRoom) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [selectedOrb, isEditingRoom]);

    // 쿼리 파라미터로 전달된 아이템/기록 자동 선택
    useEffect(() => {
        if (!room || autoSelectDone) return;

        const selectType = searchParams.get('select');
        const selectId = searchParams.get('id');

        if (selectType && selectId) {
            if (selectType === 'item') {
                const item = room.items.find(i => i.id === selectId);
                if (item) {
                    setSelectedOrb({ type: 'item', data: item });
                }
            } else if (selectType === 'record') {
                const record = room.records.find(r => r.id === selectId);
                if (record) {
                    setSelectedOrb({ type: 'record', data: record });
                }
            }
            setAutoSelectDone(true);
        }
    }, [room, searchParams, autoSelectDone]);

    // Stable callback references (rerender-functional-setstate)
    const handleOrbClick = useCallback((type: 'item' | 'record', data: Item | Record) => {
        setSelectedOrb({ type, data });
        setIsEditing(false);
    }, []);

    const startEditing = useCallback(() => {
        if (!selectedOrb) return;

        // 이미지 초기화 (기존 이미지가 있으면 사용, 없으면 빈 입력 필드 하나)
        const images = selectedOrb.data.images.length > 0 ? [...selectedOrb.data.images] : [''];
        setEditImages(images);

        if (selectedOrb.type === 'item') {
            const item = selectedOrb.data as Item;
            setEditName(item.name || '');
            setEditDescription(item.description || '');
            setEditPrice(item.price || '0');
            setEditBuyUrl(item.buyUrl || '');
            setEditSale(item.sale);
            setEditPurchasedAt(item.purchasedAt ? item.purchasedAt.split('T')[0] : '');
        } else {
            const record = selectedOrb.data as Record;
            setEditText(record.text || '');
        }
        setIsEditing(true);
    }, [selectedOrb]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
    }, []);

    const handleSave = useCallback(async () => {
        if (!selectedOrb) return;

        setSaving(true);
        try {
            const endpoint = selectedOrb.type === 'item'
                ? `/api/rooms/items/${selectedOrb.data.id}`
                : `/api/rooms/records/${selectedOrb.data.id}`;

            // 빈 이미지 URL 필터링
            const images = editImages.filter(url => url.trim());

            const body = selectedOrb.type === 'item'
                ? { name: editName, description: editDescription, price: editPrice, buyUrl: editBuyUrl, sale: editSale, images, purchasedAt: editPurchasedAt || null }
                : { text: editText, images };

            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('수정에 실패했습니다.');

            // 룸 데이터 새로고침
            await fetchRoom();
            setSelectedOrb(null);
            setIsEditing(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }, [selectedOrb, editImages, editName, editDescription, editPrice, editBuyUrl, editSale, editPurchasedAt, editText, fetchRoom]);

    const handleDelete = useCallback(async () => {
        if (!selectedOrb) return;
        if (!confirm('정말 삭제하시겠습니까?')) return;

        setSaving(true);
        try {
            const endpoint = selectedOrb.type === 'item'
                ? `/api/rooms/items/${selectedOrb.data.id}`
                : `/api/rooms/records/${selectedOrb.data.id}`;

            const res = await fetch(endpoint, { method: 'DELETE' });

            if (!res.ok) throw new Error('삭제에 실패했습니다.');

            // 룸 데이터 새로고침
            await fetchRoom();
            setSelectedOrb(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }, [selectedOrb, fetchRoom]);

    // 룸 수정 시작
    const startEditingRoom = useCallback(() => {
        if (!room) return;
        setEditRoomName(room.name || '');
        setEditRoomDescription(room.description || '');
        setEditIsLocked(room.isLocked);
        setIsEditingRoom(true);
        fetchRoomKeys(room.id);
    }, [room, fetchRoomKeys]);

    // 룸 수정 취소
    const cancelEditingRoom = useCallback(() => {
        setIsEditingRoom(false);
    }, []);

    // 룸 저장
    const handleSaveRoom = useCallback(async () => {
        if (!room) return;

        setSavingRoom(true);
        try {
            const res = await fetch(`/api/rooms/${room.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editRoomName,
                    description: editRoomDescription,
                    isLocked: editIsLocked,
                }),
            });

            if (!res.ok) throw new Error('룸 수정에 실패했습니다.');

            const updated = await res.json();
            setRoom(updated);
            setIsEditingRoom(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setSavingRoom(false);
        }
    }, [room, editRoomName, editRoomDescription, editIsLocked]);

    // 인증 로딩 중
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    // 비로그인 상태
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Lock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
                        룸을 구경하려면 로그인이 필요합니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-tesla-red text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
                        >
                            <LogIn className="w-5 h-5" />
                            로그인
                        </Link>
                        <Link
                            href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`}
                            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:border-tesla-red hover:text-tesla-red transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            회원가입
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <p className="text-red-500">{error || '룸을 찾을 수 없습니다.'}</p>
                <Link
                    href={`/${category}/room`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tesla-red text-white hover:bg-red-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    피드로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <RoomFloatingButtons
                backHref={`/${category}/room`}
                addHref={isOwner ? `/${category}/room/new` : undefined}
            />

            {/* 2D 룸 */}
            <Room room={room} isOwner={!!isOwner} onOrbClick={handleOrbClick} onSettingsClick={startEditingRoom} />

            {/* 구슬 상세 모달 */}
            <AnimatePresence>
                {selectedOrb && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                        onClick={() => { setSelectedOrb(null); setIsEditing(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto"
                        >
                            {/* 모달 헤더 */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    {selectedOrb.type === 'item' ? (
                                        <ShoppingBag className="w-5 h-5 text-tesla-red" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                    )}
                                    <span className="font-semibold">
                                        {selectedOrb.type === 'item' ? '아이템' : '기록'}
                                        {isEditing && ' 수정'}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(selectedOrb.data.createdAt), 'yyyy.MM.dd')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setSelectedOrb(null); setIsEditing(false); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 모달 컨텐츠 */}
                            <div className="p-4">
                                {/* 이미지 */}
                                {selectedOrb.data.images.length > 0 && !isEditing && (
                                    <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        <img
                                            src={selectedOrb.data.images[0]}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* 아이템 상세 / 수정 폼 */}
                                {selectedOrb.type === 'item' && (
                                    <div>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">이름</label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">상품 설명</label>
                                                    <textarea
                                                        value={editDescription}
                                                        onChange={e => setEditDescription(e.target.value)}
                                                        rows={3}
                                                        placeholder="상품에 대한 설명을 입력하세요"
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">구매 일자</label>
                                                    <DatePicker
                                                        value={editPurchasedAt}
                                                        onChange={setEditPurchasedAt}
                                                        placeholder="구매 일자 선택"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">이미지 URL</label>
                                                    {editImages.map((url, index) => (
                                                        <div key={index} className="flex gap-2 mb-2">
                                                            <input
                                                                type="url"
                                                                value={url}
                                                                onChange={e => setEditImages(prev => prev.map((v, i) => i === index ? e.target.value : v))}
                                                                placeholder="https://..."
                                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                                            />
                                                            {editImages.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditImages(prev => prev.filter((_, i) => i !== index))}
                                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditImages(prev => [...prev, ''])}
                                                        className="text-sm text-tesla-red flex items-center gap-1"
                                                    >
                                                        <ImagePlus className="w-4 h-4" />
                                                        이미지 추가
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="editSale"
                                                        checked={editSale}
                                                        onChange={e => setEditSale(e.target.checked)}
                                                        className="w-4 h-4"
                                                    />
                                                    <label htmlFor="editSale" className="text-sm">판매중</label>
                                                </div>
                                                {editSale && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">가격</label>
                                                        <input
                                                            type="number"
                                                            value={editPrice}
                                                            onChange={e => setEditPrice(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">구매 링크</label>
                                                    <input
                                                        type="url"
                                                        value={editBuyUrl}
                                                        onChange={e => setEditBuyUrl(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-bold mb-2">
                                                    {(selectedOrb.data as Item).name || '이름 없음'}
                                                </h3>
                                                {(selectedOrb.data as Item).description && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                                                        {(selectedOrb.data as Item).description}
                                                    </p>
                                                )}
                                                {(selectedOrb.data as Item).purchasedAt && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                        구매일: {format(new Date((selectedOrb.data as Item).purchasedAt!), 'yyyy.MM.dd')}
                                                    </p>
                                                )}
                                                {(selectedOrb.data as Item).sale && (selectedOrb.data as Item).price && (
                                                    <p className="text-2xl font-bold text-tesla-red mb-4">
                                                        ₩{Number((selectedOrb.data as Item).price).toLocaleString()}
                                                    </p>
                                                )}
                                                {(selectedOrb.data as Item).buyUrl && (
                                                    <a
                                                        href={(selectedOrb.data as Item).buyUrl!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        구매 링크
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* 기록 상세 / 수정 폼 */}
                                {selectedOrb.type === 'record' && (
                                    <div>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">내용</label>
                                                    <textarea
                                                        value={editText}
                                                        onChange={e => setEditText(e.target.value)}
                                                        rows={5}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">이미지 URL</label>
                                                    {editImages.map((url, index) => (
                                                        <div key={index} className="flex gap-2 mb-2">
                                                            <input
                                                                type="url"
                                                                value={url}
                                                                onChange={e => setEditImages(prev => prev.map((v, i) => i === index ? e.target.value : v))}
                                                                placeholder="https://..."
                                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                                            />
                                                            {editImages.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditImages(prev => prev.filter((_, i) => i !== index))}
                                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditImages(prev => [...prev, ''])}
                                                        className="text-sm text-blue-500 flex items-center gap-1"
                                                    >
                                                        <ImagePlus className="w-4 h-4" />
                                                        이미지 추가
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {(selectedOrb.data as Record).text || '내용 없음'}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 소유자일 때 수정/삭제 버튼 */}
                                {isOwner && (
                                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={cancelEditing}
                                                    disabled={saving}
                                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-tesla-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    저장
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={startEditing}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    수정
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 룸 수정 모달 */}
            <AnimatePresence>
                {isEditingRoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                        onClick={cancelEditingRoom}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* 모달 헤더 */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    <span className="font-semibold">룸 설정</span>
                                </div>
                                <button
                                    onClick={cancelEditingRoom}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 모달 컨텐츠 */}
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">룸 이름</label>
                                    <input
                                        type="text"
                                        value={editRoomName}
                                        onChange={e => setEditRoomName(e.target.value)}
                                        placeholder="룸 이름을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">설명</label>
                                    <textarea
                                        value={editRoomDescription}
                                        onChange={e => setEditRoomDescription(e.target.value)}
                                        placeholder="룸에 대한 설명을 입력하세요"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 resize-none"
                                    />
                                </div>

                                {/* 잠금 토글 */}
                                <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-zinc-800">
                                    <div>
                                        <label className="block text-sm font-medium">룸 잠금</label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            잠금 시 공개 피드에 노출되지 않습니다
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditIsLocked(!editIsLocked)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editIsLocked ? 'bg-tesla-red' : 'bg-gray-300 dark:bg-zinc-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsLocked ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* 키 관리 (잠금 ON일 때만) */}
                                {editIsLocked && (
                                    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <KeyRound className="w-4 h-4 text-zinc-500" />
                                                <label className="text-sm font-medium">룸 키 관리</label>
                                            </div>
                                            <button
                                                onClick={handleCreateKey}
                                                disabled={creatingKey}
                                                className="text-sm text-tesla-red flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {creatingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                                키 생성
                                            </button>
                                        </div>
                                        {loadingKeys ? (
                                            <div className="flex justify-center py-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                            </div>
                                        ) : roomKeys.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                                                생성된 키가 없습니다
                                            </p>
                                        ) : (
                                            roomKeys.map(key => (
                                                <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                                    <div>
                                                        <code className="text-sm font-mono font-bold">{key.code}</code>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{key._count.registrations}명 등록</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => copyToClipboard(key.code)}
                                                            className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                                                            title="복사"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteKey(key.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="삭제"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* 버튼 */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={cancelEditingRoom}
                                        disabled={savingRoom}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSaveRoom}
                                        disabled={savingRoom}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-tesla-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        {savingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        저장
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
