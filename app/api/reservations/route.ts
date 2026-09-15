import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import prismaClient from "../../../lib/db";

export async function GET(req: NextRequest){
    try {
        const userId = await getUserIdFromRequest(req);
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const getReservations = await prismaClient.reservation.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        if(getReservations.length === 0){
            return NextResponse.json({
                msg: "Reservation not found"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "Reservations fetched successfully",
            getReservations
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}