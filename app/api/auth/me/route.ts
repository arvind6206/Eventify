import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest){
    try {
        const users = await prismaClient.user.findMany()
        return NextResponse.json({
            msg: "users fetched successfully",
            users
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Error while fetching users"
        }, {status: 400})
    }
}

