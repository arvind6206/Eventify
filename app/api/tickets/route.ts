import { NextRequest, NextResponse } from "next/server";
import { TicketSchema } from "../../../lib/validator/ticketValidator";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import prismaClient from "../../../lib/db";

export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        
        const result = TicketSchema.safeParse(body)

        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }

        const {bookingId} = result.data;

        const userId = await getUserIdFromRequest(req)
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const booking = await prismaClient.booking.findFirst({
            where: {
                id: bookingId,
                userId
            },
            include: {
                bookingItems: true
            }
        })

        if(!booking){
            return NextResponse.json({
                msg: "Booking not found"
            }, {status: 404})
        }

        if(booking.status !== 'CONFIRMED'){
            return NextResponse.json({
                msg: "Tickets can only be generaed for a confirmed booking"
            }, {status: 409})
        }

        //check whether ticket already exists

        const existingTickets = await prismaClient.ticket.findMany({
            where: {
                bookingId: booking.id
            }
        })

        if(existingTickets.length > 0){
            return NextResponse.json({
                msg: "Tickets have already been generated for this booking"
            }, {status: 409})
        }

        const ticketCode = `EVT-${crypto.randomUUID()}`

        const tickets = await prismaClient.$transaction(async(tx) => {
            const createdTickets = []

            for(const item of booking.bookingItems){
                for(let i = 0; i < item.quantity; i++){
                    const ticket = await tx.ticket.create({
                        data: {
                            bookingId: booking.id,
                            bookingItemId: item.id,
                            ticketCode: ticketCode,
                            status: "ACTIVE"
                        }
                    })

                    createdTickets.push(ticket)
                }
            }
            return createdTickets
        })

        return NextResponse.json({
            msg: "Tickets generated sucessfully",
            tickets
        }, {status: 201})

    } catch (error) {
        console.error("Generate tickets error: ",error)

        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}