import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";
import { ReservationSchema } from "../../../../../lib/validator/reservationValidation";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json(
                {
                    msg: "Unauthorized"
                },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    msg: "eventId is required"
                },
                { status: 400 }
            );
        }

        const body = await req.json();

        const result = ReservationSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const {
            eventSeatId,
            ticketTypeId,
            quantity
        } = result.data;

        const event = await prismaClient.event.findUnique({
            where: {
                id
            }
        });

        if (!event) {
            return NextResponse.json(
                {
                    msg: "Event not found"
                },
                { status: 404 }
            );
        }

        // 5. Event must be published
        if (event.status !== "PUBLISHED") {
            return NextResponse.json(
                {
                    msg: "This event is not available for reservation"
                },
                { status: 409 }
            );
        }

        // 6. Find TicketType
        const ticketType = await prismaClient.ticketType.findFirst({
            where: {
                id: ticketTypeId,
                eventId: id
            }
        });

        if (!ticketType) {
            return NextResponse.json(
                {
                    msg: "Ticket type not found"
                },
                { status: 404 }
            );
        }

        // SEATED EVENT

        if (event.type === "SEATED") {

            if (!eventSeatId) {
                return NextResponse.json(
                    {
                        msg: "eventSeatId is required for seated events"
                    },
                    { status: 400 }
                );
            }

            // Only one seat can be reserved at a time
            if (quantity !== 1) {
                return NextResponse.json(
                    {
                        msg: "Quantity must be 1 for seated events"
                    },
                    { status: 400 }
                );
            }

            // 7. Find EventSeat
            const eventSeat = await prismaClient.eventSeat.findFirst({
                where: {
                    id: eventSeatId,
                    eventId: id
                }
            });

            if (!eventSeat) {
                return NextResponse.json(
                    {
                        msg: "Event seat not found"
                    },
                    { status: 404 }
                );
            }

            // 8. Check ticket type assigned to this seat
            if (eventSeat.ticketTypeId !== ticketTypeId) {
                return NextResponse.json(
                    {
                        msg: "Ticket type does not match this seat"
                    },
                    { status: 409 }
                );
            }

            // 9. Check seat availability
            if (eventSeat.status !== "AVAILABLE") {
                return NextResponse.json(
                    {
                        msg: "Seat is not available"
                    },
                    { status: 409 }
                );
            }

            // 10. Create reservation + reserve seat
            const reservation = await prismaClient.$transaction(
                async (tx) => {

                    // Atomically change AVAILABLE -> RESERVED
                    const updatedSeat =
                        await tx.eventSeat.updateMany({
                            where: {
                                id: eventSeatId,
                                eventId: id,
                                status: "AVAILABLE"
                            },
                            data: {
                                status: "RESERVED"
                            }
                        });

                    // Someone else reserved it meanwhile
                    if (updatedSeat.count !== 1) {
                        throw new Error("Seat not available");
                    }

                    const expiresAt = new Date(
                        Date.now() + 10 * 60 * 1000
                    );

                    const reservation =
                        await tx.reservation.create({
                            data: {
                                userId,
                                eventId: id,
                                eventSeatId,
                                ticketTypeId,
                                quantity: 1,
                                status: "ACTIVE",
                                expiresAt
                            }
                        });

                    return reservation;
                }
            );

            return NextResponse.json(
                {
                    msg: "Seat reserved successfully",
                    reservation
                },
                { status: 201 }
            );
        }

        // GENERAL ADMISSION EVENT

        if (event.type === "GENERAL_ADMISSION") {

            // eventSeatId should NOT be provided
            if (eventSeatId) {
                return NextResponse.json(
                    {
                        msg: "eventSeatId is not allowed for general admission events"
                    },
                    { status: 400 }
                );
            }

            // Quantity must be positive
            if (quantity < 1) {
                return NextResponse.json(
                    {
                        msg: "Quantity must be at least 1"
                    },
                    { status: 400 }
                );
            }

            const reservation =
                await prismaClient.$transaction(
                    async (tx) => {

                        const now = new Date();

                        // Expire old active reservations
                        await tx.reservation.updateMany({
                            where: {
                                eventId: id,
                                ticketTypeId,
                                status: "ACTIVE",
                                expiresAt: {
                                    lte: now
                                }
                            },
                            data: {
                                status: "EXPIRED"
                            }
                        });

                        // Calculate currently reserved quantity
                        const activeReservations =
                            await tx.reservation.aggregate({
                                where: {
                                    eventId: id,
                                    ticketTypeId,
                                    status: "ACTIVE",
                                    expiresAt: {
                                        gt: now
                                    }
                                },
                                _sum: {
                                    quantity: true
                                }
                            });

                        const reservedQuantity =
                            activeReservations._sum.quantity ?? 0;

                        const remainingQuantity =
                            ticketType.quantity - reservedQuantity;

                        if (remainingQuantity < quantity) {
                            throw new Error("NOT_ENOUGH_TICKETS");
                        }

                        const expiresAt = new Date(
                            Date.now() + 10 * 60 * 1000
                        );

                        return await tx.reservation.create({
                            data: {
                                userId,
                                eventId: id,
                                ticketTypeId,
                                quantity,
                                status: "ACTIVE",
                                expiresAt
                            }
                        });
                    }
                );

            return NextResponse.json(
                {
                    msg: "Tickets reserved successfully",
                    reservation
                },
                { status: 201 }
            );
        }

    } catch (error) {

        console.error(error);

        if (
            error instanceof Error &&
            error.message === "SEAT_NOT_AVAILABLE"
        ) {
            return NextResponse.json(
                {
                    msg: "Seat is no longer available"
                },
                { status: 409 }
            );
        }

        if (
            error instanceof Error &&
            error.message === "NOT_ENOUGH_TICKETS"
        ) {
            return NextResponse.json(
                {
                    msg: "Not enough tickets available"
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                msg: "Internal Server Error"
            },
            { status: 500 }
        );
    }
}