import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import { BookingSchema } from "../../../lib/validator/bookingValidator";
import prismaClient from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1. Get logged-in user
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // 2. Get request body
    const body = await req.json();

    // 3. Validate request body
    const result = BookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          msg: "Invalid request data",
          error: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const { reservationId } = result.data;

    // 4. Find reservation belonging to logged-in user
    const reservation = await prismaClient.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
      },
      include: {
        event: true,
        ticketType: true,
        eventSeat: {
          include: {
            seat: true,
          },
        },
      },
    });

    // 5. Check reservation exists
    if (!reservation) {
      return NextResponse.json(
        {
          msg: "Reservation not found",
        },
        {
          status: 404,
        },
      );
    }

    // 6. Reservation must be ACTIVE
    if (reservation.status !== "ACTIVE") {
      return NextResponse.json(
        {
          msg: "Only an ACTIVE reservation can be converted into a booking",
        },
        {
          status: 409,
        },
      );
    }

    // 7. Check reservation expiration
    if (reservation.expiresAt <= new Date()) {
      await prismaClient.$transaction(async (tx) => {
        // Mark reservation as expired
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "EXPIRED",
          },
        });

        // Release seat for seated event
        if (reservation.eventSeatId) {
          await tx.eventSeat.update({
            where: {
              id: reservation.eventSeatId,
            },
            data: {
              status: "AVAILABLE",
            },
          });
        }
      });

      return NextResponse.json(
        {
          msg: "Reservation has expired",
        },
        {
          status: 409,
        },
      );
    }

    // 8. Check ticket type
    if (!reservation.ticketType) {
      return NextResponse.json(
        {
          msg: "Ticket type not found",
        },
        {
          status: 404,
        },
      );
    }

    // 9. Calculate total amount on backend
    const unitPrice = reservation.ticketType.price;

    const totalAmount = unitPrice * reservation.quantity;

    // 10. Create booking + booking item +
    // reservation confirmation + seat booking
    const booking = await prismaClient.$transaction(async (tx) => {
      // Create Booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          eventId: reservation.eventId,
          totalAmount,
          status: "CONFIRMED",
        },
      });

      // Create BookingItem
      await tx.bookingItem.create({
        data: {
          bookingId: newBooking.id,
          eventSeatId: reservation.eventSeatId,
          ticketTypeId: reservation.ticketTypeId,
          quantity: reservation.quantity,
          unitPrice,
          totalPrice: totalAmount,
        },
      });

      // Mark reservation as confirmed
      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "CONFIRMED",
        },
      });

      // For seated event:
      // RESERVED -> BOOKED
      if (reservation.eventSeatId) {
        const updatedSeat = await tx.eventSeat.updateMany({
          where: {
            id: reservation.eventSeatId,
            status: "RESERVED",
          },
          data: {
            status: "BOOKED",
          },
        });

        if (updatedSeat.count !== 1) {
          throw new Error("EVENT_SEAT_NOT_RESERVED");
        }
      }

      return newBooking;
    });

    // 11. Success response
    return NextResponse.json(
      {
        msg: "Booking created successfully",
        booking,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "EVENT_SEAT_NOT_RESERVED") {
      return NextResponse.json(
        {
          msg: "Seat is no longer reserved",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const findBooking = await prismaClient.booking.findMany({
      where: {
        userId,
      },
      include: {
        event: true,
        bookingItems: {
          include: {
            ticketType: true,
            eventSeat: {
              include: {
                seat: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(
      {
        msg: "Booking fetched successfully",
        findBooking
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
