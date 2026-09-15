import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import { PaymentSchema } from "../../../lib/validator/paymentValidator";
import prismaClient from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 3. Validate request body
    const result = PaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { reservationId } = result.data;

    const reservation = await prismaClient.reservation.findFirst({
      where: {
        id: reservationId,
        userId,
      },
      include: {
        ticketType: true,
        eventSeat: true,
        event: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation not found",
        },
        { status: 404 }
      );
    }

    // 6. Check reservation status
    if (reservation.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: `Reservation cannot be paid because its status is ${reservation.status}`,
        },
        { status: 409 }
      );
    }

    // 7. Check reservation expiration
    if (reservation.expiresAt <= new Date()) {
      await prismaClient.$transaction(async (tx) => {
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "EXPIRED",
          },
        });

        // Release seated event seat
        if (reservation.eventSeatId) {
          await tx.eventSeat.updateMany({
            where: {
              id: reservation.eventSeatId,
              status: "RESERVED",
            },
            data: {
              status: "AVAILABLE",
            },
          });
        }
      });

      return NextResponse.json(
        {
          success: false,
          message: "Reservation has expired",
        },
        { status: 409 }
      );
    }

    // 8. Make sure ticket type exists
    if (!reservation.ticketType) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket type not found",
        },
        { status: 404 }
      );
    }

    // 9. Check if payment already exists for this reservation
    const existingPayment = await prismaClient.payment.findUnique({
      where: {
        reservationId: reservation.id,
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment already exists for this reservation",
          payment: existingPayment,
        },
        { status: 409 }
      );
    }

    // 10. Calculate amount on the server
    const unitPrice = reservation.ticketType.price;

    const totalAmount = unitPrice * reservation.quantity;

    // 11. Create payment
    const payment = await prismaClient.payment.create({
      data: {
        reservationId: reservation.id,
        userId,
        amount: totalAmount,
        status: "PENDING",
      },
    });

    // 12. Return response
    return NextResponse.json(
      {
        success: true,
        message: "Payment created successfully",
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

        const payments = await prismaClient.payment.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(
            {
                msg: "Payments fetched successfully",
                payments
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                msg: "Internal Server Error"
            },
            { status: 500 }
        );
    }
}