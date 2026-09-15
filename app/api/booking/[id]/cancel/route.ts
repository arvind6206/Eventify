import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const {id} = await params;
    if(!id){
        return NextResponse.json({
            msg: "bookingId is required"
        }, {status: 400})
    }

    const bookings = await prismaClient.booking.findFirst({
        where: {
            id,
            userId
        },
        include: {
            bookingItems: true
        }
    })

    if(!bookings){
        return NextResponse.json({
            msg: "Booking not found"
        }, {status: 404})
    }

    if(bookings.status !== 'CONFIRMED'){
        return NextResponse.json({
            msg: "Only a CONFIRMED booking can be cancelled"
        }, {status: 409})
    }

    //cancel booking and release Seat
    const cancelledBooking = await prismaClient.$transaction(async (tx) => {
        //update booking status
        const updateBooking = await tx.booking.update({
            where: {
                id: bookings.id
            },
            data: {
                status: "CANCELLED"
            }
        })

        //release all seats belonging to this Booking

        for(const item of bookings.bookingItems){
            if(item.eventSeatId){
                const releasedSeat = await tx.eventSeat.updateMany({
                    where: {
                        id: item.eventSeatId,
                        status: "BOOKED"
                    },
                    data: {
                        status: "AVAILABLE"
                    }
                })

                //if the seat was expected to be booked but wasn't,
                // rollback the whole Transaction

                if(releasedSeat.count !== 1){
                    throw new Error("EVENT_SEAT Not Booked")
                }

            }
        }

        return updateBooking
    })

    return NextResponse.json({
        msg: "Booking cancelled successfully",
        booking: cancelledBooking
    }, {status: 200})
  } catch (error) {
    console.error(error)
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
