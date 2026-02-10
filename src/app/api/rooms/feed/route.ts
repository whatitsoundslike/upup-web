import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export type FeedItem = {
    id: string;
    type: 'item' | 'record';
    roomId: string;
    memberId: string;
    memberName: string | null;
    roomName: string | null;
    images: string[];
    createdAt: string;
    // Item specific
    name?: string | null;
    sale?: boolean;
    price?: string;
    buyUrl?: string | null;
    // Record specific
    text?: string | null;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!category) {
            return NextResponse.json(
                { error: "Category is required" },
                { status: 400 }
            );
        }

        // 해당 카테고리의 룸 ID들 조회
        const rooms = await prisma.room.findMany({
            where: { category },
            select: { id: true, name: true, memberId: true, member: { select: { name: true } } },
        });

        const roomIds = rooms.map(r => r.id);
        const roomMap = new Map(rooms.map(r => [r.id.toString(), { name: r.name, memberName: r.member.name }]));

        if (roomIds.length === 0) {
            return NextResponse.json({ items: [], nextCursor: null });
        }

        // Items 조회
        const items = await prisma.item.findMany({
            where: { roomId: { in: roomIds } },
            orderBy: { createdAt: 'desc' },
            take: limit * 2,
        });

        // Records 조회
        const records = await prisma.record.findMany({
            where: { roomId: { in: roomIds } },
            orderBy: { createdAt: 'desc' },
            take: limit * 2,
        });

        // 통합 피드 생성
        const feed: FeedItem[] = [
            ...items.map(item => ({
                id: item.id.toString(),
                type: 'item' as const,
                roomId: item.roomId.toString(),
                memberId: item.memberId.toString(),
                memberName: roomMap.get(item.roomId.toString())?.memberName || null,
                roomName: roomMap.get(item.roomId.toString())?.name || null,
                images: item.images as string[],
                createdAt: item.createdAt.toISOString(),
                name: item.name,
                sale: item.sale,
                price: item.price.toString(),
                buyUrl: item.buyUrl,
            })),
            ...records.map(record => ({
                id: record.id.toString(),
                type: 'record' as const,
                roomId: record.roomId.toString(),
                memberId: record.memberId.toString(),
                memberName: roomMap.get(record.roomId.toString())?.memberName || null,
                roomName: roomMap.get(record.roomId.toString())?.name || null,
                images: record.images as string[],
                createdAt: record.createdAt.toISOString(),
                text: record.text,
            })),
        ];

        // 최신순 정렬
        feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 커서 기반 페이지네이션
        let startIndex = 0;
        if (cursor) {
            const cursorIndex = feed.findIndex(item => item.id === cursor && item.type === (cursor.startsWith('i') ? 'item' : 'record'));
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }

        const paginatedFeed = feed.slice(startIndex, startIndex + limit);
        const nextCursor = paginatedFeed.length === limit ? paginatedFeed[paginatedFeed.length - 1]?.id : null;

        return NextResponse.json({
            items: paginatedFeed,
            nextCursor,
        });
    } catch (error) {
        console.error("Failed to fetch feed:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
