import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

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
        const { roomId, text, images } = body;

        if (!roomId) {
            return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
        }

        // 룸 소유권 확인
        const room = await prisma.room.findUnique({ where: { id: BigInt(roomId) } });
        if (!room || room.memberId !== member.id) {
            return NextResponse.json({ error: "Room not found or unauthorized" }, { status: 403 });
        }

        const record = await prisma.record.create({
            data: {
                roomId: BigInt(roomId),
                memberId: member.id,
                text: text || null,
                images: images || [],
            },
        });

        return NextResponse.json(serializeBigInt(record), { status: 201 });
    } catch (error) {
        console.error("Failed to create record:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
