import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          msg: "paymentId is required",
        },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await prismaClient.payment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        reservation: {
          include: {
            ticketType: true,
            eventSeat: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        {
          msg: "Payment not found",
        },
        { status: 404 }
      );
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json(
        {
          msg: "Payment already processed",
          payment,
        },
        { status: 200 }
      );
    }

    const reservation = payment.reservation;
    if (!reservation) {
      return NextResponse.json(
        {
          msg: "Reservation not found",
        },
        { status: 404 }
      );
    }

    // Process payment directly (similar to webhook logic)
    const result = await prismaClient.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "SUCCESS",
          method: payment.method || "CARD"
        }
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId: payment.userId,
          eventId: reservation.eventId,
          totalAmount: payment.amount,
          status: "CONFIRMED"
        }
      });

      // Create booking item
      const bookingItem = await tx.bookingItem.create({
        data: {
          bookingId: booking.id,
          eventSeatId: reservation.eventSeatId,
          ticketTypeId: reservation.ticketTypeId,
          quantity: reservation.quantity,
          unitPrice: reservation.ticketType?.price || 0,
          totalPrice: payment.amount
        }
      });

      // Update reservation status
      await tx.reservation.update({
        where: {
          id: reservation.id
        },
        data: {
          status: "CONFIRMED"
        }
      });

      // Update event seat if exists
      if (reservation.eventSeatId) {
        await tx.eventSeat.updateMany({
          where: {
            id: reservation.eventSeatId,
            status: "RESERVED"
          },
          data: {
            status: "BOOKED"
          }
        });
      }

      // Connect payment to booking
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          bookingId: booking.id
        }
      });

      // Generate tickets automatically
      const ticketCode = `EVT-${crypto.randomUUID()}`
      const createdTickets = []
      
      for(let i = 0; i < reservation.quantity; i++){
        const ticket = await tx.ticket.create({
          data: {
            bookingId: booking.id,
            bookingItemId: bookingItem.id,
            ticketCode: ticketCode,
            status: "ACTIVE"
          }
        })
        createdTickets.push(ticket)
      }

      return {
        payment: updatedPayment,
        booking,
        bookingItem,
        tickets: createdTickets
      };
    });

    return NextResponse.json({
      msg: "Payment processed successfully",
      payment: result.payment,
      booking: result.booking,
      bookingItem: result.bookingItem,
      tickets: result.tickets
    }, { status: 200 });

  } catch (error) {
    console.error("Process payment error:", error);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}