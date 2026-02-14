import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

function generateCode(): string {
    return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

// 키 목록 조회 (방 주인만)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({ where: { uid: session.uid } });
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const { id } = await params;
        const room = await prisma.room.findUnique({ where: { id: BigInt(id) } });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const keys = await prisma.roomKey.findMany({
            where: { roomId: room.id },
            include: { _count: { select: { registrations: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(serializeBigInt(keys));
    } catch (error) {
        console.error("Failed to fetch room keys:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 키 생성 (방 주인만)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({ where: { uid: session.uid } });
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const { id } = await params;
        const room = await prisma.room.findUnique({ where: { id: BigInt(id) } });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 유니크 코드 생성 (충돌 시 재시도)
        let code: string;
        let attempts = 0;
        do {
            code = generateCode();
            const existing = await prisma.roomKey.findUnique({ where: { code } });
            if (!existing) break;
            attempts++;
        } while (attempts < 5);

        const key = await prisma.roomKey.create({
            data: { roomId: room.id, code },
            include: { _count: { select: { registrations: true } } },
        });

        return NextResponse.json(serializeBigInt(key), { status: 201 });
    } catch (error) {
        console.error("Failed to create room key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
