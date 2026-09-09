import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";

export async function POST(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const userId = await getUserIdFromRequest(req);
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

        const findEvent = await prismaClient.event.findUnique({
            where: {
                id
            }
        })

        if(!findEvent){
            return NextResponse.json({
                msg: "Event not found"
            }, {status: 404})
        }

        //find venue
        const findEventVenue = await prismaClient.venue.findUnique({
            where: {
                id: findEvent.venueId
            }
        })

        if(!findEventVenue){
            return NextResponse.json({
                msg: "Venue not found"
            }, {status: 404})
        }

        //find Seats
        const findSeats = await prismaClient.seat.findMany({
            where: {
                venueId: findEventVenue.id
            }
        })

        if(findSeats.length === 0){
            return NextResponse.json({
                msg: "Seat not found"
            }, {status: 404})
        }



        const eventSeat = await prismaClient.eventSeat.createMany({
            data: findSeats.map((seat) => ({
                eventId: id,
                seatId: seat.id,
                status: "AVAILABLE"
            })),
            skipDuplicates: true         
        })

        return NextResponse.json({
            msg: "Event seats created successfully",
            eventSeat
        }, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const userId = await getUserIdFromRequest(req);
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

        const findEvent = await prismaClient.event.findUnique({
            where: {
                id
            }
        })

        if(!findEvent){
            return NextResponse.json({
                msg: "Event not found"
            }, {status: 404})
        }

        const getEventSeats = await prismaClient.eventSeat.findMany({
            where: {
                eventId: id,
            },
            include: {
                seat: true
            },
            orderBy: [
                {
                    seat: {
                        row: "asc"
                    }
                },
                {
                    seat: {
                        number: "asc"
                    }
                }
            ]
        })

        if(getEventSeats.length === 0){
            return NextResponse.json({
                msg: "No seat found for this event"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "Event seats fetched successfully",
            getEventSeats
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}