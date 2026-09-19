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
    const body = await req.json();
    const { reason } = body;

    const payment = await prismaClient.payment.findUnique({
      where: { id },
      include: {
        booking: true,
        reservation: true
      }
    });

    if (!payment) {
      return NextResponse.json({ msg: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "REFUNDED") {
      return NextResponse.json({ msg: "Payment already refunded" }, { status: 409 });
    }

    if (payment.status !== "SUCCESS") {
      return NextResponse.json({ msg: "Only successful payments can be refunded" }, { status: 400 });
    }

    // Process refund using transaction
    const result = await prismaClient.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { 
          status: "REFUNDED",
          transactionId: `REFUND-${crypto.randomUUID()}`
        }
      });

      // Cancel associated booking if exists
      if (payment.bookingId) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CANCELLED" }
        });

        // Cancel all tickets
        await tx.ticket.updateMany({
          where: { bookingId: payment.bookingId },
          data: { status: "CANCELLED" }
        });
      }

      // Cancel associated reservation if exists
      if (payment.reservationId) {
        await tx.reservation.update({
          where: { id: payment.reservationId },
          data: { status: "CANCELLED" }
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      msg: "Payment refunded successfully",
      payment: result,
      refundReason: reason || "Admin initiated refund"
    }, { status: 200 });

  } catch (error) {
    console.error("Refund payment error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}