'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    ShoppingBag,
    MessageSquare,
    Loader2,
    ImagePlus,
    Check,
    ChevronDown,
    Lock,
    LogIn,
    UserPlus,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import DatePicker from '@/components/ui/DatePicker';

interface Room {
    id: string;
    name: string | null;
    category: string;
    _count: { items: number; records: number };
}

interface RoomCreateFormProps {
    category: string;
}

type FormType = 'item' | 'record';

export default function RoomCreateForm({ category }: RoomCreateFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);
    const [formType, setFormType] = useState<FormType>('item');
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(true);

    // 룸 생성 폼
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDescription, setNewRoomDescription] = useState('');

    // 아이템 폼
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemImages, setItemImages] = useState<string[]>(['']);
    const [itemSale, setItemSale] = useState(false);
    const [itemPrice, setItemPrice] = useState('');
    const [itemBuyUrl, setItemBuyUrl] = useState('');
    const [itemPurchasedAt, setItemPurchasedAt] = useState('');

    // 기록 폼
    const [recordText, setRecordText] = useState('');
    const [recordImages, setRecordImages] = useState<string[]>(['']);

    const fetchMyRooms = useCallback(async () => {
        try {
            const res = await fetch(`/api/rooms?category=${category}&my=true`);
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
                if (data.length > 0) {
                    setSelectedRoom(data[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
        } finally {
            setLoadingRooms(false);
        }
    }, [category]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchMyRooms();
        }
    }, [fetchMyRooms, authLoading, user]);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    name: newRoomName,
                    description: newRoomDescription,
                    images: [],
                }),
            });
            if (res.ok) {
                const room = await res.json();
                setRooms(prev => [room, ...prev]);
                setSelectedRoom(room);
                setShowCreateRoom(false);
                setNewRoomName('');
                setNewRoomDescription('');
            }
        } catch (err) {
            console.error('Failed to create room:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitItem = async () => {
        if (!selectedRoom || !itemName.trim()) return;
        setLoading(true);
        try {
            const images = itemImages.filter(url => url.trim());
            const res = await fetch('/api/rooms/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    name: itemName,
                    description: itemDescription || null,
                    images,
                    sale: itemSale,
                    price: itemPrice ? parseInt(itemPrice) : 0,
                    buyUrl: itemBuyUrl || null,
                    purchasedAt: itemPurchasedAt || null,
                }),
            });
            if (res.ok) {
                router.push(`/${category}/room`);
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to create item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRecord = async () => {
        if (!selectedRoom || (!recordText.trim() && recordImages.every(url => !url.trim()))) return;
        setLoading(true);
        try {
            const images = recordImages.filter(url => url.trim());
            const res = await fetch('/api/rooms/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    text: recordText,
                    images,
                }),
            });
            if (res.ok) {
                router.push(`/${category}/room`);
                router.refresh();
            }
        } catch (err) {
            console.error('Failed to create record:', err);
        } finally {
            setLoading(false);
        }
    };

    const addImageField = (type: 'item' | 'record') => {
        if (type === 'item') {
            setItemImages(prev => [...prev, '']);
        } else {
            setRecordImages(prev => [...prev, '']);
        }
    };

    const updateImageField = (type: 'item' | 'record', index: number, value: string) => {
        if (type === 'item') {
            setItemImages(prev => prev.map((v, i) => i === index ? value : v));
        } else {
            setRecordImages(prev => prev.map((v, i) => i === index ? value : v));
        }
    };

    const removeImageField = (type: 'item' | 'record', index: number) => {
        if (type === 'item') {
            setItemImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setRecordImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    // 인증 로딩 중
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    // 비로그인 상태
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
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
                        콘텐츠를 등록하려면 로그인이 필요합니다.
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

    // 룸 로딩 중
    if (loadingRooms) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
    
            {/* 뒤로가기 버튼 */}
            <Link
                href={`/${category}/room`}
                className="fixed bottom-24 md:bottom-8 left-4 md:left-8 w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors z-40"
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* 룸 선택 */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">룸 선택</label>
                {rooms.length === 0 && !showCreateRoom ? (
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-tesla-red hover:text-tesla-red transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        첫 번째 룸 만들기
                    </button>
                ) : (
                    <div className="relative">
                        <button
                            onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-between bg-white dark:bg-zinc-900"
                        >
                            <span>{selectedRoom?.name || '룸을 선택하세요'}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform ${showRoomDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showRoomDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden"
                                >
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => {
                                                setSelectedRoom(room);
                                                setShowRoomDropdown(false);
                                            }}
                                            className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between"
                                        >
                                            <span>{room.name || '이름 없는 룸'}</span>
                                            {selectedRoom?.id === room.id && <Check className="w-4 h-4 text-tesla-red" />}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setShowCreateRoom(true);
                                            setShowRoomDropdown(false);
                                        }}
                                        className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-tesla-red flex items-center gap-2 border-t border-gray-200 dark:border-gray-700"
                                    >
                                        <Plus className="w-4 h-4" />
                                        새 룸 만들기
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* 새 룸 만들기 모달 */}
            <AnimatePresence>
                {showCreateRoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                        onClick={() => setShowCreateRoom(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6"
                        >
                            <h2 className="text-xl font-bold mb-4">새 룸 만들기</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">룸 이름 *</label>
                                    <input
                                        type="text"
                                        value={newRoomName}
                                        onChange={e => setNewRoomName(e.target.value)}
                                        placeholder="예: 작고 소중한 내 방"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">설명 (선택)</label>
                                    <textarea
                                        value={newRoomDescription}
                                        onChange={e => setNewRoomDescription(e.target.value)}
                                        placeholder="룸에 대한 간단한 설명"
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateRoom(false)}
                                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleCreateRoom}
                                    disabled={!newRoomName.trim() || loading}
                                    className="flex-1 p-3 bg-tesla-red text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    만들기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 콘텐츠 타입 선택 */}
            {selectedRoom && (
                <>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">등록 유형</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFormType('item')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                                    formType === 'item'
                                        ? 'border-tesla-red bg-tesla-red/10 text-tesla-red'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                아이템
                            </button>
                            <button
                                onClick={() => setFormType('record')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                                    formType === 'record'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                기록
                            </button>
                        </div>
                    </div>

                    {/* 아이템 폼 */}
                    {formType === 'item' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">아이템 이름 *</label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={e => setItemName(e.target.value)}
                                    placeholder="예: 삼성 모니터 27인치"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">상품 설명</label>
                                <textarea
                                    value={itemDescription}
                                    onChange={e => setItemDescription(e.target.value)}
                                    placeholder="상품에 대한 설명을 입력하세요"
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">구매 일자</label>
                                <DatePicker
                                    value={itemPurchasedAt}
                                    onChange={setItemPurchasedAt}
                                    placeholder="구매 일자 선택"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">이미지 URL</label>
                                {itemImages.map((url, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={e => updateImageField('item', index, e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                        />
                                        {itemImages.length > 1 && (
                                            <button
                                                onClick={() => removeImageField('item', index)}
                                                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => addImageField('item')}
                                    className="text-sm text-tesla-red flex items-center gap-1"
                                >
                                    <ImagePlus className="w-4 h-4" />
                                    이미지 추가
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={itemSale}
                                        onChange={e => setItemSale(e.target.checked)}
                                        className="w-5 h-5 rounded accent-tesla-red"
                                    />
                                    <span className="text-sm font-medium">판매 가능</span>
                                </label>
                            </div>

                            {itemSale && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium mb-1">가격 (원)</label>
                                        <input
                                            type="number"
                                            value={itemPrice}
                                            onChange={e => setItemPrice(e.target.value)}
                                            placeholder="50000"
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">구매 링크 (선택)</label>
                                        <input
                                            type="url"
                                            value={itemBuyUrl}
                                            onChange={e => setItemBuyUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <button
                                onClick={handleSubmitItem}
                                disabled={!itemName.trim() || loading}
                                className="w-full p-4 bg-tesla-red text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                아이템 등록
                            </button>
                        </motion.div>
                    )}

                    {/* 기록 폼 */}
                    {formType === 'record' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">내용</label>
                                <textarea
                                    value={recordText}
                                    onChange={e => setRecordText(e.target.value)}
                                    placeholder="기록하고 싶은 내용을 작성하세요..."
                                    rows={5}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">이미지 URL</label>
                                {recordImages.map((url, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={e => updateImageField('record', index, e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                                        />
                                        {recordImages.length > 1 && (
                                            <button
                                                onClick={() => removeImageField('record', index)}
                                                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => addImageField('record')}
                                    className="text-sm text-blue-500 flex items-center gap-1"
                                >
                                    <ImagePlus className="w-4 h-4" />
                                    이미지 추가
                                </button>
                            </div>

                            <button
                                onClick={handleSubmitRecord}
                                disabled={(!recordText.trim() && recordImages.every(url => !url.trim())) || loading}
                                className="w-full p-4 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                기록 등록
                            </button>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
