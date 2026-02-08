import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import SharePageClient from './SharePageClient';

type CharacterData = {
    id: string;
    name: string;
    level: number;
    className: string;
    element: string;
    image?: string;
};

type RankCharacter = {
    name: string;
    level: number;
    className: string | null;
    element: string | null;
    imageUrl: string | null;
};

type GameSaveRow = {
    rankCharacter: RankCharacter | null;
};

async function _getCharacter(id: string): Promise<CharacterData | null> {
    try {
        // rankCharacter에서 바로 찾기 (활성 캐릭터만 공유 가능)
        const results = await prisma.$queryRaw<GameSaveRow[]>`
            SELECT rankCharacter
            FROM GameSave
            WHERE rankCharacterId = ${id} AND rankCharacter IS NOT NULL
            LIMIT 1
        `;

        if (results.length > 0 && results[0].rankCharacter) {
            const char = results[0].rankCharacter;
            return {
                id,
                name: char.name,
                level: char.level,
                className: char.className ?? '',
                element: char.element ?? '',
                image: char.imageUrl ?? undefined,
            };
        }

        return null;
    } catch {
        return null;
    }
}

const CACHE_REVALIDATE = 3600; // 1시간
const isDev = process.env.NODE_ENV === 'development';

async function getCharacter(id: string): Promise<CharacterData | null> {
    if (isDev) {
        return _getCharacter(id);
    }
    return unstable_cache(
        () => _getCharacter(id),
        [`share-character-${id}`],
        { revalidate: CACHE_REVALIDATE }
    )();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const character = await getCharacter(id);

    const baseTitle = '내 반려동물을 슈퍼 영웅으로! - ZROOM Superpet';
    const baseDescription = '반려동물 정보로 게임 캐릭터를 생성하고, 던전에서 배틀하세요. 펫 기반 RPG 커뮤니티.';
    const keywords = '반려동물게임, 펫RPG, 슈퍼펫, 반려동물캐릭터, 펫던전, 반려동물커뮤니티';

    if (!character) {
        return {
            title: baseTitle,
            description: baseDescription,
            keywords,
        };
    }

    const title = `${character.name} - ${baseTitle}`;
    const description = `Lv.${character.level} ${character.className} | ${character.element} - ${baseDescription}`;

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: character.image ? [{ url: character.image, width: 600, height: 800 }] : [],
            type: 'website',
            siteName: 'ZROOM Superpet',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: character.image ? [character.image] : [],
        },
    };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const character = await getCharacter(id);

    return <SharePageClient character={character} />;
}
