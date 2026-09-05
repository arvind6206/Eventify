import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../lib/db";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){

    try {
        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "id is required"
            }, {status: 400})
        }

        const findUser = await prismaClient.user.findUnique({
            where: {
                id
            }
        })
        return NextResponse.json({
            msg: "User fetched successfully",
            findUser
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Error while fetching single user"
        }, {status: 400})
    }
}