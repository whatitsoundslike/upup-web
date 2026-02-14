import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const myOnly = searchParams.get("my") === "true";

        const where: Record<string, unknown> = {};
        if (category) where.category = category;

        if (myOnly) {
            const session = await getSession();
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const member = await prisma.member.findUnique({ where: { uid: session.uid } });
            if (member) where.memberId = member.id;
        } else {
            // 공개 목록에서 잠긴 룸 제외
            where.isLocked = false;
        }

        const rooms = await prisma.room.findMany({
            where,
            include: {
                member: { select: { id: true, name: true, email: true } },
                _count: { select: { items: true, records: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(serializeBigInt(rooms));
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({ where: { uid: session.uid } });
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const body = await request.json();
        const { category, name, description, images } = body;

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        const room = await prisma.room.create({
            data: {
                memberId: member.id,
                category,
                name: name || null,
                description: description || null,
                images: images || [],
            },
        });

        return NextResponse.json(serializeBigInt(room), { status: 201 });
    } catch (error) {
        console.error("Failed to create room:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
