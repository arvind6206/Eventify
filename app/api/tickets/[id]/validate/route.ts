import { PrismaClient } from './../../../../generated/prisma/client';
import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../lib/db";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json(
                { msg: "Unauthenticated" },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { msg: "Ticket ID is required" },
                { status: 400 }
            );
        }

        // Find the user

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
        // Find the ticket

         if(user.role === 'USER'){
            return NextResponse.json({
                msg: "you are not allowed to validate tickets"
            }, {status: 400})
        }

        const ticket = await prismaClient.ticket.findFirst({
            where: {
                id
            },
            include: {
                booking: {
                    include: {
                        event: true
                    }
                },
                bookingItem: {
                    include: {
                        ticketType: true,
                        eventSeat: {
                            include: {
                                seat: true
                            }
                        }
                    }
                }
            }
        })

        if(!ticket){
            return NextResponse.json({
                msg: "ticket not found"
            }, {status: 404})
        }

        // Check ADMIN / ORGANIZER permission

        if(user.role === 'ORGANIZER' && ticket.booking.event.organizerId != userId){
            return NextResponse.json({
                msg: "You are not allowed to validate this tickets"
            }, {status: 403})
        }

       
        // Check ticket status

        if(ticket.status === 'CANCELLED'){
            return NextResponse.json({
                msg: "Tickets has been cancelled"
            }, {status: 409})
        }

        // Change ACTIVE → USED

        const updatedTicket = await prismaClient.ticket.updateMany({
            where: {
                id: ticket.id,
                status: "ACTIVE"
            },
            data: {
                status: 'USED',
                usedAt: new Date()
            }
        })

        if(updatedTicket.count !== 1){
            return NextResponse.json({
                msg: "Ticket has already been used or is no longer active"
            }, {status: 409})
        }

        const validatedTicket = await prismaClient.ticket.findUnique({
            where: {
                id: ticket.id
            },
            include: {
                booking: {
                    include: {
                        event: true
                    }
                },
                bookingItem: {
                    include: {
                        ticketType: true,
                        eventSeat: {
                            include: {
                                seat: true
                            }
                        }
                    }
                }
            }
        })
        
        return NextResponse.json({
            msg: "Ticket validated successfully",
            ticket: validatedTicket
        }, {status: 200})

    } catch (error) {
        console.error("Ticket validation error:", error);

        return NextResponse.json(
            { msg: "Internal Server Error" },
            { status: 500 }
        );
    }
}