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
