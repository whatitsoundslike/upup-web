// =============================================
// Gem 지급/사용 출처 통합 관리
// 새로운 출처 추가/삭제 시 이 파일만 수정하면 됩니다.
// =============================================

// ===== 지급 출처 (Issue Sources) =====
export const GEM_ISSUE_SOURCES = {
  purchase: 'purchase',           // 결제
  reward: 'reward',               // 보상
  event: 'event',                 // 이벤트
  compensation: 'compensation',   // 보상/환불
  admin: 'admin',                 // 관리자 지급
} as const;

export type GemIssueSource = typeof GEM_ISSUE_SOURCES[keyof typeof GEM_ISSUE_SOURCES];

export const GEM_ISSUE_SOURCE_LIST = Object.values(GEM_ISSUE_SOURCES);

// ===== 사용처 (Use Sources) =====
export const GEM_USE_SOURCES = {
  create_character: 'create_character',   // 캐릭터 생성 (2번째부터)
  revive: 'revive',                       // 부활
  shop_item: 'shop_item',                 // 상점 아이템 구매
  gacha: 'gacha',                         // 가챠
  upgrade: 'upgrade',                     // 강화
} as const;

export type GemUseSource = typeof GEM_USE_SOURCES[keyof typeof GEM_USE_SOURCES];

export const GEM_USE_SOURCE_LIST = Object.values(GEM_USE_SOURCES);

// ===== 유효성 검사 헬퍼 =====
export function isValidIssueSource(source: string): source is GemIssueSource {
  return GEM_ISSUE_SOURCE_LIST.includes(source as GemIssueSource);
}

export function isValidUseSource(source: string): source is GemUseSource {
  return GEM_USE_SOURCE_LIST.includes(source as GemUseSource);
}
