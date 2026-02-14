import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const room = await prisma.room.findUnique({
            where: { id: BigInt(id) },
            include: {
                member: {
                    select: { id: true, name: true, email: true },
                },
                items: {
                    orderBy: { createdAt: "desc" },
                },
                records: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // 잠긴 룸 접근 제어
        if (room.isLocked) {
            const session = await getSession();
            const member = session
                ? await prisma.member.findUnique({ where: { uid: session.uid } })
                : null;

            const isOwner = member && room.member.id === member.id;
            if (!isOwner) {
                // 키 등록 여부 확인
                const hasKey = member
                    ? await prisma.roomKeyRegistration.findFirst({
                        where: {
                            memberId: member.id,
                            roomKey: { roomId: room.id },
                        },
                    })
                    : null;

                if (!hasKey) {
                    return NextResponse.json(
                        { error: "이 룸은 잠겨있습니다. 룸 키가 필요합니다." },
                        { status: 403 }
                    );
                }
            }
        }

        return NextResponse.json(serializeBigInt(room));
    } catch (error) {
        console.error("Failed to fetch room:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
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

        const body = await request.json();
        const { name, description, isLocked } = body;

        const updated = await prisma.room.update({
            where: { id: BigInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isLocked !== undefined && { isLocked: Boolean(isLocked) }),
            },
            include: {
                member: {
                    select: { id: true, name: true, email: true },
                },
                items: {
                    orderBy: { createdAt: "desc" },
                },
                records: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        return NextResponse.json(serializeBigInt(updated));
    } catch (error) {
        console.error("Failed to update room:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
