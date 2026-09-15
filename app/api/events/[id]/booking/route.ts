import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const userId = await getUserIdFromRequest(req)
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "eventId is required"
            }, {status: 400})
        }

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            return NextResponse.json({
                msg: "user not found"
            }, {status: 404})
        }

        if(user.role === 'USER'){
            return NextResponse.json({
                msg: "user is  not allowed to get the bookings"
            }, {status: 400})
        }

        const event = await prismaClient.event.findUnique({
            where: {
                id,
            }
        })

        if(!event){
            return NextResponse.json({
                msg: "Event not found"
            }, {status: 404})
        }

        if(user.role === 'ORGANIZER' && event.organizerId !== userId){
            return NextResponse.json({
                msg: "You are not allowed to view bookings for this event"
            }, {status: 403})
        }

        const bookings = await prismaClient.booking.findMany({
            where: {
                eventId: id
            },
            include: {
                user: true,
                items: {
                    include: {
                        ticketType: true,
                        eventSeat: {
                            include: {
                                seat: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        if(bookings.length === 0){
            return NextResponse.json({
                msg: "Booking not found",
                "bookings": []
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "Evenet bookings fetched successfully",
            bookings
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        })
    }
}