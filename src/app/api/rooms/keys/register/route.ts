import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

// 코드로 키 등록
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
        const { code } = body;

        if (!code || typeof code !== "string") {
            return NextResponse.json({ error: "코드를 입력해주세요" }, { status: 400 });
        }

        const roomKey = await prisma.roomKey.findUnique({
            where: { code: code.toUpperCase().trim() },
            include: { room: { select: { id: true, name: true, memberId: true } } },
        });

        if (!roomKey) {
            return NextResponse.json({ error: "유효하지 않은 코드입니다" }, { status: 404 });
        }

        // 방 주인은 등록 불필요
        if (roomKey.room.memberId === member.id) {
            return NextResponse.json({ error: "본인의 룸 키는 등록할 수 없습니다" }, { status: 400 });
        }

        // 이미 등록 확인
        const existing = await prisma.roomKeyRegistration.findUnique({
            where: { roomKeyId_memberId: { roomKeyId: roomKey.id, memberId: member.id } },
        });

        if (existing) {
            return NextResponse.json({ error: "이미 등록된 키입니다" }, { status: 409 });
        }

        await prisma.roomKeyRegistration.create({
            data: { roomKeyId: roomKey.id, memberId: member.id },
        });

        return NextResponse.json(serializeBigInt({
            success: true,
            roomId: roomKey.room.id,
            roomName: roomKey.room.name,
        }));
    } catch (error) {
        console.error("Failed to register room key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
