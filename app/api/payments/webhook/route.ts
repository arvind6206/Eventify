import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";

export async function POST(req: NextRequest){
    try {
        const body = await req.json()

        const {paymentId, status} = body
        if(!paymentId || !status){
            return NextResponse.json({
                msg: "paymentId and status are required"
            }, {status: 400})
        }

        if(status !== 'SUCCESS'){
            return NextResponse.json({
                msg: "Unsupported payment status"
            }, {status: 400})
        }

        const payment = await prismaClient.payment.findUnique({
            where: {
                id: paymentId,
            },
            include: {
                reservation: {
                    include: {
                        ticketType: true,
                        eventSeat: true,
                    }
                }
            }
        })

        if(!payment){
            return NextResponse.json({
                msg: "Payment not found"
            }, {status: 404})
        }

        if(payment.status === 'SUCCESS'){
            return NextResponse.json({
                msg: "Payment has already been processed"
            }, {status: 200})
        }

        //make sure reservation exists
        const reservation = payment.reservation;

        if(!reservation){
            return NextResponse.json({
                msg: "Reservation not found"
            }, {status: 404})
        }

        //check reservation status
        if(reservation.status !== 'ACTIVE'){
            return NextResponse.json({
                msg: `Reservation can not be confirmed because its status is ${reservation.status}`
            }, {status: 409})
        }

        //rcheck reservation expiration
        if(reservation.expiresAt <= new Date()){
            await prismaClient.$transaction(async (tx) => {
                await tx.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: "EXPIRED"
                    }
                })

                //release seat if this is a seated Event
                if(reservation.eventSeatId){
                    await tx.eventSeat.updateMany({
                        where: {
                            id: reservation.eventSeatId,
                            status: "RESERVED"
                        },
                        data: {
                            status: "AVAILABLE"
                        }
                    })
                }
            })

            return NextResponse.json({
                msg: "Reservation has expired"
            }, {status: 409})
        }

        //ticketType must exist
        if(!reservation.ticketType){
            return NextResponse.json({
                msg: "Ticket type not found"
            }, {status: 404})
        }

        //Process everything in one Transaction
        const result = await prismaClient.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status: "SUCCESS"
                }
            })

            const booking = await tx.booking.create({
                data: {
                    userId: payment.userId,
                    eventId: reservation.eventId,
                    totalAmount: payment.amount,
                    status: "CONFIRMED"
                }
            })


            const bookingItem = await tx.bookingItem.create({
                data: {
                    bookingId: booking.id,
                    eventSeatId: reservation.eventSeatId,
                    ticketTypeId: reservation.ticketTypeId,
                    quantity: reservation.quantity,
                    unitPrice: reservation.ticketType.price,
                    totalPrice: payment.amount
                }
            })

            //confirm Reservation
            if(reservation.eventSeatId){
                const updatedSeat = await tx.eventSeat.updateMany({
                    where: {
                        id: reservation.eventSeatId,
                        status: "RESERVED"
                    },
                    data: {
                        status: "BOOKED"
                    }
                })

                if(updatedSeat.count !== 1){
                   throw new Error("Event Seat not reserved")
                }
            }

            //connect payment to Booking

            await tx.payment.update({
                where: {
                    id: payment.id,
                },
                data: {
                    bookingId: booking.id
                }
            })

            return {
                payment: updatedPayment,
                booking,
                bookingItem
            }

        })

        return NextResponse.json({
            msg: "Payment processed successfully",
            payment: result.payment,
            booking: result.booking,
            bookingItem: result.bookingItem
        }, {status: 200})
    } catch (error) {
        console.error("Payment webhook error:", error);

    // Seat state conflict
    if (
      error instanceof Error &&
      error.message === "EVENT_SEAT_NOT_RESERVED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Seat is no longer reserved",
        },
        { status: 409 }
      );
    }

    // Unexpected error
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
    }
}