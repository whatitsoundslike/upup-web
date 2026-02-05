// Gem API 유틸리티

// 출처는 gemSources.ts에서 통합 관리
export {
  GEM_ISSUE_SOURCES,
  GEM_USE_SOURCES,
  type GemIssueSource,
  type GemUseSource,
} from './gemSources';

import type { GemIssueSource, GemUseSource } from './gemSources';

// ===== 타입 정의 =====
export type GemBalance = {
  balance: number;
};

export type GemApiResult = {
  success: boolean;
  balance?: number;
  error?: string;
};

// ===== API 함수 =====

// Gem 잔액 조회
export async function fetchGemBalance(): Promise<GemBalance | null> {
  try {
    const res = await fetch('/api/superpet/gem');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Gem 지급
export async function issueGem(
  amount: number,
  source: GemIssueSource,
  memo?: string
): Promise<GemApiResult> {
  try {
    const res = await fetch('/api/superpet/gem/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, source, memo }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error };
    }
    return { success: true, balance: data.balance };
  } catch {
    return { success: false, error: '네트워크 오류' };
  }
}

// Gem 사용
export async function useGem(
  amount: number,
  source: GemUseSource,
  memo?: string
): Promise<GemApiResult> {
  try {
    const res = await fetch('/api/superpet/gem/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, source, memo }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error };
    }
    return { success: true, balance: data.balance };
  } catch {
    return { success: false, error: '네트워크 오류' };
  }
}
