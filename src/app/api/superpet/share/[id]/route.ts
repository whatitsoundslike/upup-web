import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CharacterData = {
    id: string;
    name: string;
    level: number;
    className: string;
    element: string;
    image?: string;
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 모든 게임 세이브에서 해당 캐릭터 ID를 찾음
        const gameSaves = await prisma.gameSave.findMany({
            where: {
                rankCharacterId: id,
            },
            select: {
                data: true,
            },
        });

        // 먼저 rankCharacterId로 찾기
        for (const save of gameSaves) {
            const data = save.data as Record<string, string | null>;
            const charactersRaw = data?.['characters'];
            if (!charactersRaw) continue;

            try {
                const characters = JSON.parse(charactersRaw) as CharacterData[];
                const character = characters.find((c) => c.id === id);
                if (character) {
                    return NextResponse.json({
                        name: character.name,
                        level: character.level,
                        className: character.className,
                        element: character.element,
                        image: character.image,
                    });
                }
            } catch {
                continue;
            }
        }

        // rankCharacterId에 없으면 전체 검색
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
                if (character) {
                    return NextResponse.json({
                        name: character.name,
                        level: character.level,
                        className: character.className,
                        element: character.element,
                        image: character.image,
                    });
                }
            } catch {
                continue;
            }
        }

        return NextResponse.json({ error: '캐릭터를 찾을 수 없습니다.' }, { status: 404 });
    } catch (error) {
        console.error('Share character fetch error:', error);
        return NextResponse.json({ error: '캐릭터 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
