import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // BigInt serialization handling
        const serializedRooms = JSON.parse(
            JSON.stringify(rooms, (key, value) =>
                typeof value === "bigint" ? value.toString() : value
            )
        );

        return NextResponse.json(serializedRooms);
    } catch (error) {
        console.error("Failed to fetch rooms:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
