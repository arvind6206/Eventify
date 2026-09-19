import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../../lib/getuserId";
import prismaClient from "../../../../../../lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ msg: "Access denied. Admin only." }, { status: 403 });
    }

    const { id } = await params;

    const booking = await prismaClient.booking.findUnique({
      where: { id },
      include: {
        bookingItems: true,
        tickets: true,
        payment: true
      }
    });

    if (!booking) {
      return NextResponse.json({ msg: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ msg: "Booking already cancelled" }, { status: 409 });
    }

    // Cancel booking using transaction
    const result = await prismaClient.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: "CANCELLED" }
      });

      // Cancel all tickets
      await tx.ticket.updateMany({
        where: { bookingId: id },
        data: { status: "CANCELLED" }
      });

      // Release event seats if any
      const bookingItems = await tx.bookingItem.findMany({
        where: { bookingId: id },
        include: { eventSeat: true }
      });

      for (const item of bookingItems) {
        if (item.eventSeat && item.eventSeat.status === "BOOKED") {
          await tx.eventSeat.update({
            where: { id: item.eventSeat.id },
            data: { status: "AVAILABLE" }
          });
        }
      }

      // Process refund if payment exists and is successful
      if (booking.payment && booking.payment.status === "SUCCESS") {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: "REFUNDED" }
        });
      }

      return updatedBooking;
    });

    return NextResponse.json({
      msg: "Booking cancelled successfully",
      booking: result
    }, { status: 200 });

  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}