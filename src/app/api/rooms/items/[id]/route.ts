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
        const item = await prisma.item.findUnique({ where: { id: BigInt(id) } });
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (item.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, images, sale, price, buyUrl, purchasedAt } = body;

        const updated = await prisma.item.update({
            where: { id: BigInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(images !== undefined && { images }),
                ...(sale !== undefined && { sale }),
                ...(price !== undefined && { price: BigInt(price) }),
                ...(buyUrl !== undefined && { buyUrl }),
                ...(purchasedAt !== undefined && { purchasedAt: purchasedAt ? new Date(purchasedAt) : null }),
            },
        });

        return NextResponse.json(serializeBigInt(updated));
    } catch (error) {
        console.error("Failed to update item:", error);
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
        const item = await prisma.item.findUnique({ where: { id: BigInt(id) } });
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (item.memberId !== member.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.item.delete({ where: { id: BigInt(id) } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete item:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
