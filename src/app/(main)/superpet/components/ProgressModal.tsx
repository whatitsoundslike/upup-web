'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProgressModalProps {
    isOpen: boolean;
    message: string;
}

export default function ProgressModal({ isOpen, message }: ProgressModalProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            return;
        }
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 8 + 2;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 pb-20 md:pb-0"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm p-6 rounded-2xl shadow-2xl bg-zinc-50 dark:bg-zinc-900"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-foreground/70 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                                {message}
                            </span>
                            <span className="text-xs font-bold text-amber-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-foreground/10 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
