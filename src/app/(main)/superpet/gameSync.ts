import { useCallback, useEffect, useRef } from 'react';
import { getItem, setItem } from './storage';

const SYNC_KEYS = ['characters', 'active-character', 'inventory'] as const;

export async function saveToServer(): Promise<boolean> {
  try {
    const data: Record<string, string | null> = {};
    for (const key of SYNC_KEYS) {
      data[key] = getItem(key);
    }

    const res = await fetch('/api/superpet/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function loadFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/superpet/save');
    if (!res.ok) return false;

    const { data } = await res.json();
    if (!data) return false;

    for (const key of SYNC_KEYS) {
      const value = data[key];
      if (value != null) {
        setItem(key, value);
      }
    }

    return true;
  } catch {
    return false;
  }
}

function getMaxLevel(charactersJson: string | null): number {
  if (!charactersJson) return 0;
  try {
    const characters = JSON.parse(charactersJson);
    if (!Array.isArray(characters) || characters.length === 0) return 0;
    return Math.max(...characters.map((c: { level?: number }) => Number(c.level ?? 0)));
  } catch {
    return 0;
  }
}

export function useDebouncedSave(delay = 10000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToServer();
      timerRef.current = null;
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        saveToServer();
      }
    };
  }, []);

  return debouncedSave;
}
