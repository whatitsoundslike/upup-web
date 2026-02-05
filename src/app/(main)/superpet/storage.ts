// 이 값을 변경하면 기존 로컬스토리지 데이터가 모두 초기화됩니다.
const STORAGE_VERSION = 'v4';

const STORAGE_PREFIX = `superpet_${STORAGE_VERSION}_`;
const VERSION_KEY = 'superpet_storage_version';

function clearPrefixedData() {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('superpet_')) {
            keysToRemove.push(key);
        }
    }
    for (const key of keysToRemove) {
        localStorage.removeItem(key);
    }
}

function checkVersion() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(VERSION_KEY);
    if (stored !== STORAGE_VERSION) {
        clearPrefixedData();
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
}

// 앱 시작 시 버전 체크
checkVersion();

export function getItem(key: string): string | null {
    return localStorage.getItem(STORAGE_PREFIX + key);
}

export function setItem(key: string, value: string): void {
    localStorage.setItem(STORAGE_PREFIX + key, value);
}

export function removeItem(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearGameData(): void {
    // Clear only game-related data, preserve other data like language preferences
    const gameKeys = ['characters', 'active-character', 'inventory'];
    for (const key of gameKeys) {
        removeItem(key);
    }
}
