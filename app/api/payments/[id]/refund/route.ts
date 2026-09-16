import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";

export async function POST(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const userId = await getUserIdFromRequest(req);
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params;

        if(!id){
            return NextResponse.json({
                msg: "paymentId is required"
            }, {status: 400})
        }

        const payment = await prismaClient.payment.findFirst({
            where: {
                id,
                userId
            },
            include: {
                booking: {
                    include: {
                        bookingItems: true
                    }
                }
            }
        })

        if(!payment){
            return NextResponse.json({
                msg: "Payment not found"
            }, {status: 404})
        }

        if(payment.status !== 'SUCCESS'){
            return NextResponse.json({
                msg: `Payment can not be refunded because its status is ${payment.status}`
            }, {status: 409})
        }

        if(!payment.booking){
            return NextResponse.json({
                msg: "Booking associated with this payment was not found",
            }, {status: 404})
        }

        //booking must be confirmed
        if(payment.booking.status !== 'CONFIRMED'){
            return NextResponse.json({
                msg: `Booking can not be refunded because its status is ${payment.booking.status}`
            }, {status: 409})
        }

        //Process refund
        const result = await prismaClient.$transaction(async (tx) => {
            const refundedPayment = await tx.payment.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status: 'REFUNDED'
                }
            })

            //update Booking

            const refundedBooking = await tx.booking.update({
                where: {
                    id: payment.booking!.id,
                },
                data: {
                    status: "REFUNDED"
                }
            })

            //release booked Seat
            for(const item of payment.booking!.bookingItems){
                if(item.eventSeatId){
                    const releasedSeat = await tx.eventSeat.updateMany({
                        where: {
                            id: item.eventSeatId,
                            status: "BOOKED",
                        },
                        data: {
                            status: "AVAILABLE"
                        }
                    })

                    if(releasedSeat.count !== 1){
                        throw new Error("Event seat not booked")
                    }
                }
            }

            return {
                payment: refundedPayment,
                booking: refundedBooking
            }
        })

        // return success

        return NextResponse.json({
            msg: "Payment refunded successfully",
            payment: result.payment,
            booking: result.booking
        }, {status: 200})
    } catch (error) {
        console.error("Refund payment error:",error)

        //seat state conflict
        if(
            error instanceof Error &&
            error.message === 'Event Seat not booked'
        ){
            return NextResponse.json({
                msg: "One or more seats are not currently booked",
            }, {status: 409})
        }

        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}