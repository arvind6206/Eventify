import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const organizerId = await getUserIdFromRequest(req)
        if(!organizerId){
            return NextResponse.json({
                mag: "Unauthorized"
            }, {status: 401})
        }

        const findOrganizer = await prismaClient.user.findUnique({
            where: {
                id: organizerId
            }
        })

        if(!findOrganizer){
            return NextResponse.json({
                msg: "organizer not found"
            }, {status: 404})
        }

        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "eventtId is required"
            }, {status: 400})
        }

        const findEvent = await prismaClient.event.findUnique({
            where: {
                id,
                organizerId: organizerId
            }
        })

        if(!findEvent){
            return NextResponse.json({
                msg: "event not found"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "seat fetched successfully",
            findEvent
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}