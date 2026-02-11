'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = '날짜 선택' }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value) : undefined;

    const handleOpen = () => {
        setIsOpen(true);
        // 캘린더가 열리면 스크롤하여 잘 보이게 함 (하단 네비게이션 고려)
        setTimeout(() => {
            if (calendarRef.current) {
                const rect = calendarRef.current.getBoundingClientRect();
                const bottomNavHeight = 80; // 하단 네비게이션 높이
                const viewportHeight = window.innerHeight;

                // 캘린더 하단이 뷰포트 아래로 벗어나면 스크롤
                if (rect.bottom > viewportHeight - bottomNavHeight) {
                    const scrollAmount = rect.bottom - viewportHeight + bottomNavHeight + 20;
                    window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 50);
    };

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
        }
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-between gap-2 hover:border-gray-400 dark:hover:border-zinc-600 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedDate ? (
                        <span className="text-gray-900 dark:text-white">
                            {format(selectedDate, 'yyyy년 MM월 dd일')}
                        </span>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full"
                    >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={calendarRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelect}
                            locale={ko}
                            showOutsideDays
                            classNames={{
                                root: 'p-3',
                                months: 'flex flex-col',
                                month: 'space-y-3',
                                month_caption: 'flex justify-center items-center h-10',
                                caption_label: 'text-sm font-semibold text-gray-900 dark:text-white',
                                nav: 'absolute top-3 inset-x-3 flex items-center justify-between',
                                button_previous: 'w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors',
                                button_next: 'w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors',
                                weekdays: 'flex',
                                weekday: 'w-9 h-9 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400',
                                week: 'flex',
                                day: 'p-0',
                                day_button: 'w-9 h-9 flex items-center justify-center text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300',
                                selected: '!bg-tesla-red !text-white hover:!bg-tesla-red',
                                today: 'font-bold text-tesla-red',
                                outside: 'text-gray-300 dark:text-gray-600',
                                disabled: 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
                            }}
                            components={{
                                Chevron: ({ orientation }) =>
                                    orientation === 'left'
                                        ? <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        : <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
