import { useCallback, useEffect, useRef } from 'react';
import { getItem, setItem } from './storage';
import { isLoggedIn } from '@/components/AuthProvider';

const SYNC_KEYS = ['characters', 'active-character', 'inventory'] as const;

// 세션 만료 이벤트
export const SESSION_EXPIRED_EVENT = 'superpet:session-expired';

// 메모리에 sessionId 저장 (탭별로 독립적)
let currentGameSessionId: string | null = null;

function getGameSessionId(): string | null {
  return currentGameSessionId;
}

function setGameSessionId(sessionId: string): void {
  currentGameSessionId = sessionId;
}

export function clearGameSessionId(): void {
  currentGameSessionId = null;
}

// 새 게임 세션 시작 (게임 페이지 진입 시 호출)
export async function startGameSession(): Promise<boolean> {
  if (!isLoggedIn()) return false;

  try {
    const res = await fetch('/api/superpet/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return false;

    const { gameSessionId } = await res.json();
    if (gameSessionId) {
      setGameSessionId(gameSessionId);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function handleSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export async function saveToServer(): Promise<boolean> {
  if (!isLoggedIn()) return false;

  try {
    const data: Record<string, string | null> = {};
    for (const key of SYNC_KEYS) {
      data[key] = getItem(key);
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const sessionId = getGameSessionId();
    if (sessionId) {
      headers['X-Game-Session-Id'] = sessionId;
    }

    const res = await fetch('/api/superpet/save', {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });

    if (res.status === 403) {
      const result = await res.json();
      if (result.error === 'SESSION_EXPIRED') {
        handleSessionExpired();
        return false;
      }
    }

    return res.ok;
  } catch {
    return false;
  }
}

export async function loadFromServer(): Promise<boolean> {
  if (!isLoggedIn()) return false;

  try {
    const headers: Record<string, string> = {};
    const sessionId = getGameSessionId();
    if (sessionId) {
      headers['X-Game-Session-Id'] = sessionId;
    }

    const res = await fetch('/api/superpet/save', { headers });

    if (res.status === 403) {
      const result = await res.json();
      if (result.error === 'SESSION_EXPIRED') {
        handleSessionExpired();
        return false;
      }
    }

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

