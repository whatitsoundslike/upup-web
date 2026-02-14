'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Plus } from 'lucide-react';
import { ReactNode } from 'react';

const BTN_BASE = "w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors";
const BTN_SECONDARY = `${BTN_BASE} bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700`;
const BTN_PRIMARY = `${BTN_BASE} bg-tesla-red text-white hover:bg-red-600`;
const BTN_PILL = "h-12 px-4 flex items-center gap-1.5 rounded-full shadow-lg transition-colors";

interface RoomFloatingButtonsProps {
    backHref: string;
    myRoomHref?: string;
    addRoomHref?: string;
    addItemHref?: string;
    children?: ReactNode;
}

export default function RoomFloatingButtons({ backHref, myRoomHref, addRoomHref, addItemHref, children }: RoomFloatingButtonsProps) {
    return (
        <div className="fixed bottom-24 md:bottom-12 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:px-6 z-40 flex items-center justify-between pointer-events-none">
            {/* 좌측 - 뒤로가기 */}
            <Link href={backHref} className={`pointer-events-auto ${BTN_SECONDARY}`}>
                <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* 우측 버튼들 */}
            <div className="flex items-center gap-2 pointer-events-auto">
                {children}
                {myRoomHref && (
                    <Link href={myRoomHref} className={`pointer-events-auto ${BTN_PILL} bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700`}>
                        <Home className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-wide">MY</span>
                    </Link>
                )}
                {addRoomHref && (
                    <Link href={addRoomHref} className={`pointer-events-auto ${BTN_PILL} bg-tesla-red text-white hover:bg-red-600`}>
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-bold tracking-wide">Room</span>
                    </Link>
                )}
                {addItemHref && (
                    <Link href={addItemHref} className={BTN_PRIMARY}>
                        <Plus className="w-6 h-6" />
                    </Link>
                )}
            </div>
        </div>
    );
}
