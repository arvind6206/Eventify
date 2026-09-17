import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import prismaClient from "../../../lib/db";
import { ReservationSchema } from "../../../lib/validator/reservationValidation";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = ReservationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventSeatId, ticketTypeId, quantity } = result.data;

    // Find the user
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    // Find the ticket type first to get the eventId
    const ticketType = await prismaClient.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      return NextResponse.json(
        { msg: "Ticket type not found" },
        { status: 404 }
      );
    }

    const eventId = ticketType.eventId;

    // Find the event
    const event = await prismaClient.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { msg: "Event not found" },
        { status: 404 }
      );
    }

    // Check if enough tickets are available
    if (ticketType.quantity < quantity) {
      return NextResponse.json(
        { msg: "Not enough tickets available" },
        { status: 400 }
      );
    }

    // Create reservation with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const reservation = await prismaClient.reservation.create({
      data: {
        userId,
        eventId,
        eventSeatId,
        ticketTypeId,
        quantity,
        status: "ACTIVE",
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        msg: "Reservation created successfully",
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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