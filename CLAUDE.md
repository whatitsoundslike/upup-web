# Zroom & Superpet

취미 카테고리 기반 커뮤니티 프로젝트

## Skills

커스텀 검증 및 유지보수 스킬은 `.claude/skills/`에 정의되어 있습니다.

| Skill                   | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `verify-implementation` | 프로젝트의 모든 verify 스킬을 순차 실행하여 통합 검증 보고서를 생성합니다       |
| `manage-skills`         | 세션 변경사항을 분석하고, 검증 스킬을 생성/업데이트하며, CLAUDE.md를 관리합니다 |

## 기술 스택

- **Next.js 16** App Router (src/app/)
- **React 19** + TypeScript (strict)
- **Tailwind CSS v4** (모바일 퍼스트)
- **Prisma 6** + MySQL
- **Framer Motion** 애니메이션
- **lucide-react** 아이콘
- **jose** JWT 인증 (HS256)
- **Vercel Blob** 이미지 저장
- **sharp** 이미지 리사이징
- **Google Generative AI** (Gemini)
- **shadcn/ui** (일부 컴포넌트)

> **참고**: `package.json`에 Zustand, tRPC가 있지만 실제 사용하지 않음. 상태 관리는 Context API + useState, API는 REST 직접 호출.

## UI/UX 규칙

- **반응형 필수**: 모바일 먼저 작성 후 `md:` 브레이크포인트로 PC 대응
- **모바일 하단 네비바**: `MobileBottomNav`(src/components/Navbar.tsx)가 `fixed bottom-0 z-50` ~70px 높이로 존재. 플로팅 UI나 하단 고정 요소는 반드시 `bottom-[70px] md:bottom-0` 패턴 사용
- **모달 패턴**: `AnimatePresence` + `motion.div`, `fixed inset-0 z-50 bg-black/50`
- **폰트**: Pretendard (CDN)

## 인증 패턴

```typescript
// 서버 (API Route)
import { getSession } from '@/lib/auth';
const session = await getSession(); // jose JWT 검증, 쿠키: auth-token (7일)
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const memberId = BigInt(session.sub); // session.sub = 유저 ID (string)

// 클라이언트
import { useAuth } from '@/components/AuthProvider';
const { user } = useAuth(); // user: { sub, uid, email, name } | null
```

## API Route 패턴

```typescript
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// BigInt → JSON 직렬화 (모든 API에서 필수)
const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => typeof v === "bigint" ? v.toString() : v));

export async function GET(request: NextRequest) {
    try {
        const result = await prisma.model.findMany(...);
        return NextResponse.json(serializeBigInt(result));
    } catch (error) {
        console.error('설명:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```

**에러 코드**: 400 (잘못된 요청) / 401 (미인증) / 403 (권한 없음) / 404 (없음) / 500 (서버)

## Prisma 컨벤션

- 모델명: PascalCase (`Member`, `Room`, `GameSave`)
- 필드명: camelCase (`memberId`, `createdAt`)
- ID: `BigInt @id @default(autoincrement())` → API 응답 시 `serializeBigInt()` 필수
- 외래키: `{모델}Id` 패턴 + `@@index` 추가
- 타임스탬프: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- 유연 데이터: `Json` 타입 (이미지 배열, 게임 데이터 등)

## 프로젝트 구조

```
src/
├── app/
│   ├── (main)/          # 메인 카테고리 레이아웃
│   │   ├── tesla/       # 테슬라
│   │   ├── baby/        # 육아
│   │   ├── superpet/    # 슈퍼펫 RPG
│   │   ├── ai/          # AI
│   │   ├── desk/        # 데스크셋업
│   │   └── pet/         # 반려동물
│   └── api/             # REST API 라우트
├── components/
│   ├── room/            # 공통 Room 컴포넌트 (RoomFeed, RoomDetailClient 등)
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── Navbar.tsx        # 상단 네비 + MobileBottomNav
│   └── AuthProvider.tsx  # 인증 Context
├── config/
│   ├── auth.ts          # 쿠키명, 만료기간
│   └── navConfig.ts     # 카테고리별 네비게이션 정의
└── lib/
    ├── auth.ts          # JWT 서명/검증, getSession()
    └── prisma.ts        # Prisma 클라이언트
```

### 네비게이션 추가 시

`src/config/navConfig.ts`에서 카테고리별 `NavItem[]` 배열에 추가:
```typescript
{ name: '한글명', nameEn: 'English', href: '/category/path', icon: LucideIcon }
```

### 서버/클라이언트 컴포넌트 분리

- `page.tsx`: 서버 컴포넌트 (metadata 정의, 데이터 페칭)
- `*Client.tsx` 또는 별도 컴포넌트: `'use client'` (인터랙션, 상태)
- Next.js 15+ params 패턴: `params: Promise<{ id: string }>` → `const { id } = await params;`

## Superpet 구조

Superpet은 반려동물 RPG 미니게임으로 `src/app/(main)/superpet/` 하위에 위치합니다.

### 주요 파일

| 경로 | 설명 |
|------|------|
| `types.ts` | 캐릭터/인벤토리/장비 인터페이스 및 비즈니스 로직 (레벨업, 장착, 강화 등) |
| `storage.ts` | localStorage 래퍼 (버전 프리픽스 `superpet_v4_`) |
| `gameSync.ts` | `useDebouncedSave()` - 서버 저장 디바운스 훅 |
| `itemData.ts` | 아이템 정의, 등급별 색상/가격/분해 매핑 |
| `i18n/translations.ts` | 한→영 번역 딕셔너리 (superpet 전용, 글로벌 i18n 아님) |
| `room/Room.tsx` | 메인 UI - 캐릭터 정보, 인벤토리, 장비 관리, 강화, 판매/분해 |
| `dungeon/Dungeon.tsx` | 던전 전투 로직 (자동전투, 드랍, 경험치) |
| `dungeon/BattleScreen.tsx` | 전투 UI (HP바, 배틀로그, 승리/패배 화면) |
| `dungeon/DungeonSelect.tsx` | 던전 선택 UI |
| `dungeon/dungeonData.ts` | 던전/몬스터 정의 |
| `mission/missionData.ts` | 일일 미션 정의 + localStorage 헬퍼 |
| `mission/Mission.tsx` | 미션 페이지 UI |
| `shop/Shop.tsx` | 상점 UI |
| `components/` | 공통 컴포넌트 (PWA, 배너 등) |

### 게임 데이터 패턴
- 캐릭터/인벤토리 데이터는 **localStorage 우선** 저장, `debouncedSaveToServer()`로 서버 동기화
- 장비 아이템은 `instanceId` (nanoid)로 고유 식별
- 일일 미션 카운터는 localStorage, 완료 로그는 서버 (MissionLog 모델)
- KST 기준 날짜 리셋 (`mission-date` 키 비교)

### Superpet i18n

```typescript
const { t, lang } = useLanguage();
// t('한국어 텍스트') → lang === 'en'이면 translations.ts에서 영어 반환
// 새 문자열 추가 시 translations.ts에 'ko': 'en' 쌍 추가 필수
```
