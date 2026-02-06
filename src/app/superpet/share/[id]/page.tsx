import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SharePageClient from './SharePageClient';

type CharacterData = {
    id: string;
    name: string;
    level: number;
    className: string;
    element: string;
    image?: string;
};

async function getCharacter(id: string): Promise<CharacterData | null> {
    try {
        // 먼저 rankCharacterId로 찾기
        const gameSaves = await prisma.gameSave.findMany({
            where: {
                rankCharacterId: id,
            },
            select: {
                data: true,
            },
        });

        for (const save of gameSaves) {
            const data = save.data as Record<string, string | null>;
            const charactersRaw = data?.['characters'];
            if (!charactersRaw) continue;

            try {
                const characters = JSON.parse(charactersRaw) as CharacterData[];
                const character = characters.find((c) => c.id === id);
                if (character) return character;
            } catch {
                continue;
            }
        }

        // 전체 검색
        const allSaves = await prisma.gameSave.findMany({
            select: {
                data: true,
            },
        });

        for (const save of allSaves) {
            const data = save.data as Record<string, string | null>;
            const charactersRaw = data?.['characters'];
            if (!charactersRaw) continue;

            try {
                const characters = JSON.parse(charactersRaw) as CharacterData[];
                const character = characters.find((c) => c.id === id);
                if (character) return character;
            } catch {
                continue;
            }
        }

        return null;
    } catch {
        return null;
    }
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
