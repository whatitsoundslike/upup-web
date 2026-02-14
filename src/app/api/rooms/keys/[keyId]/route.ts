import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// 키 삭제 (방 주인만)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ keyId: string }> }
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

        const { keyId } = await params;
        const roomKey = await prisma.roomKey.findUnique({
            where: { id: BigInt(keyId) },
            include: { room: { select: { memberId: true } } },
        });

        if (!roomKey) {
            return NextResponse.json({ error: "Key not found" }, { status: 404 });
        }

        if (roomKey.room.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.roomKey.delete({ where: { id: BigInt(keyId) } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete room key:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
