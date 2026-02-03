'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { saveToServer } from '../gameSync';

const AUTO_SAVE_INTERVAL = 10 * 60 * 1000; // 10 minutes

export default function AutoSave() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            saveToServer();
        }, AUTO_SAVE_INTERVAL);

        return () => clearInterval(interval);
    }, [user]);

    return null;
}
