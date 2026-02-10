import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const serializeBigInt = (data: unknown) =>
    JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

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
        const record = await prisma.record.findUnique({ where: { id: BigInt(id) } });
        if (!record) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        if (record.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { text, images } = body;

        const updated = await prisma.record.update({
            where: { id: BigInt(id) },
            data: {
                ...(text !== undefined && { text }),
                ...(images !== undefined && { images }),
            },
        });

        return NextResponse.json(serializeBigInt(updated));
    } catch (error) {
        console.error("Failed to update record:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
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
        const record = await prisma.record.findUnique({ where: { id: BigInt(id) } });
        if (!record) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        if (record.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.record.delete({ where: { id: BigInt(id) } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete record:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
