import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";
import { ValidateTicketSchema } from "../../../../lib/validator/ticketValidator";

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const userId = await getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Unauthenticated"
                },
                { status: 401 }
            );
        }

        // 2. Read request body
        const body = await req.json();

        // 3. Validate request body
        const result = ValidateTicketSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Invalid request data",
                    errors: result.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const { ticketCode } = result.data;

        // 4. Find the user
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "User not found"
                },
                { status: 404 }
            );
        }

        // 5. Only ADMIN and ORGANIZER can validate tickets
        if (user.role !== "ADMIN" && user.role !== "ORGANIZER") {
            return NextResponse.json(
                {
                    success: false,
                    msg: "You are not allowed to validate tickets"
                },
                { status: 403 }
            );
        }

        // 6. Find ticket using ticketCode
        const ticket = await prismaClient.ticket.findUnique({
            where: {
                ticketCode
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
        });

        // 7. Ticket not found
        if (!ticket) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Ticket not found"
                },
                { status: 404 }
            );
        }

        // 8. Organizer can only validate tickets
        // belonging to their own events
        if (
            user.role === "ORGANIZER" &&
            ticket.booking.event.organizerId !== userId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "You are not allowed to validate this ticket"
                },
                { status: 403 }
            );
        }

        // 9. Check ticket status
        if (ticket.status === "CANCELLED") {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Ticket has been cancelled"
                },
                { status: 409 }
            );
        }

        if (ticket.status === "USED") {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Ticket has already been used"
                },
                { status: 409 }
            );
        }

        // 10. Atomically change ACTIVE → USED
        const updatedTicket = await prismaClient.ticket.updateMany({
            where: {
                id: ticket.id,
                status: "ACTIVE"
            },
            data: {
                status: "USED",
                usedAt: new Date()
            }
        });

        // 11. Handle concurrent scanning
        if (updatedTicket.count !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    msg: "Ticket has already been used or is no longer active"
                },
                { status: 409 }
            );
        }

        // 12. Get updated ticket
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
        });

        // 13. Return success
        return NextResponse.json(
            {
                success: true,
                msg: "Ticket validated successfully",
                ticket: validatedTicket
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Ticket validation error:", error);

        return NextResponse.json(
            {
                success: false,
                msg: "Internal Server Error"
            },
            { status: 500 }
        );
    }
}