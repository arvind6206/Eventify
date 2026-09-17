import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest){
    try {
        const userId = await getUserIdFromRequest(req);
        
        if (!userId) {
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })
        
        if (!user) {
            return NextResponse.json({
                msg: "User not found"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "User fetched successfully",
            user
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Error while fetching user"
        }, {status: 500})
    }
}

