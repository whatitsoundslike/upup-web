'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Loader2, CheckCircle } from 'lucide-react';

interface RoomKeyRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RoomKeyRegisterModal({ isOpen, onClose, onSuccess }: RoomKeyRegisterModalProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    const handleSubmit = useCallback(async () => {
        if (!code.trim()) {
            setError('코드를 입력해주세요');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/rooms/keys/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '등록에 실패했습니다.');
                return;
            }

            setSuccess(`"${data.roomName || '룸'}" 키가 등록되었습니다!`);
            setCode('');
            setTimeout(() => {
                onSuccess?.();
                onClose();
                setSuccess(null);
            }, 1200);
        } catch {
            setError('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [code, onClose, onSuccess]);

    const handleClose = useCallback(() => {
        setCode('');
        setError(null);
        setSuccess(null);
        onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-tesla-red" />
                                <span className="font-semibold">룸 키 등록</span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 컨텐츠 */}
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                전달받은 룸 키 코드를 입력하세요.
                            </p>

                            <input
                                type="text"
                                value={code}
                                onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="코드 입력"
                                maxLength={20}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-center font-mono text-lg tracking-widest uppercase placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                                autoFocus
                            />

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

                            {success && (
                                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    {success}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !code.trim() || !!success}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-tesla-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                등록
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
