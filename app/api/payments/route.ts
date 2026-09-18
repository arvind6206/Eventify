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
      // If payment already exists and is PENDING, try to process it
      if (existingPayment.status === "PENDING") {
        try {
          // Process existing payment directly
          const result = await prismaClient.$transaction(async (tx) => {
            // Get reservation details
            const existingReservation = await tx.reservation.findUnique({
              where: { id: existingPayment.reservationId },
              include: { ticketType: true }
            });

            if (!existingReservation || existingReservation.status !== "ACTIVE") {
              throw new Error("Reservation not valid for processing");
            }

            // Update payment status
            const updatedPayment = await tx.payment.update({
              where: {
                id: existingPayment.id,
              },
              data: {
                status: "SUCCESS",
                method: body.method || existingPayment.method || "CARD"
              }
            });

            // Create booking
            const booking = await tx.booking.create({
              data: {
                userId: existingPayment.userId,
                eventId: existingReservation.eventId,
                totalAmount: existingPayment.amount,
                status: "CONFIRMED"
              }
            });

            // Create booking item
            const bookingItem = await tx.bookingItem.create({
              data: {
                bookingId: booking.id,
                eventSeatId: existingReservation.eventSeatId,
                ticketTypeId: existingReservation.ticketTypeId,
                quantity: existingReservation.quantity,
                unitPrice: existingReservation.ticketType?.price || 0,
                totalPrice: existingPayment.amount
              }
            });

            // Update reservation status
            await tx.reservation.update({
              where: {
                id: existingReservation.id
              },
              data: {
                status: "CONFIRMED"
              }
            });

            // Update event seat if exists
            if (existingReservation.eventSeatId) {
              await tx.eventSeat.updateMany({
                where: {
                  id: existingReservation.eventSeatId,
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
                id: existingPayment.id,
              },
              data: {
                bookingId: booking.id
              }
            });

            // Generate tickets automatically
            const ticketCode = `EVT-${crypto.randomUUID()}`
            const createdTickets = []
            
            for(let i = 0; i < existingReservation.quantity; i++){
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

          return NextResponse.json(
            {
              success: true,
              message: "Payment processed successfully",
              payment: result.payment,
              booking: result.booking,
              tickets: result.tickets,
            },
            { status: 200 }
          );
        } catch (webhookError) {
          console.error('Payment processing failed for existing payment:', webhookError);
        }
      }
      
      // If payment exists and is not PENDING, or processing failed, return existing payment
      return NextResponse.json(
        {
          success: false,
          message: existingPayment.status === "SUCCESS" 
            ? "Payment already completed" 
            : "Payment already exists for this reservation",
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
        method: body.method || "CARD",
      },
    });

    // 12. Process payment immediately using direct database operations
    // This simulates payment gateway success without webhook call
    try {
      const result = await prismaClient.$transaction(async (tx) => {
        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "SUCCESS",
            method: body.method || "CARD"
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
            unitPrice: reservation.ticketType.price,
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

      // 13. Return response with booking information
      return NextResponse.json(
        {
          success: true,
          message: "Payment processed successfully",
          payment: result.payment,
          booking: result.booking,
          tickets: result.tickets,
        },
        { status: 201 }
      );
    } catch (transactionError) {
      console.error('Payment processing transaction failed:', transactionError);
      // Still return the payment even if transaction fails, as it's in PENDING state
      return NextResponse.json(
        {
          success: true,
          message: "Payment created but processing may be delayed",
          payment,
        },
        { status: 201 }
      );
    }
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
            include: {
                reservation: {
                    include: {
                        event: true
                    }
                },
                booking: true
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