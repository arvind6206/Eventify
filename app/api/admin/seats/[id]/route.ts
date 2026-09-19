import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";

export async function PATCH(
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

    const updatedSeat = await prismaClient.seat.update({
      where: { id },
      data: {
        row: body.row,
        number: body.number,
        section: body.section,
        type: body.type
      }
    });

    return NextResponse.json({
      msg: "Seat updated successfully",
      seat: updatedSeat
    }, { status: 200 });

  } catch (error) {
    console.error("Update seat error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check if seat is in use
    const eventSeats = await prismaClient.eventSeat.count({
      where: { 
        seatId: id,
        status: { in: ["RESERVED", "BOOKED"] }
      }
    });

    if (eventSeats > 0) {
      return NextResponse.json({ 
        msg: "Cannot delete seat that is reserved or booked." 
      }, { status: 409 });
    }

    await prismaClient.seat.delete({
      where: { id }
    });

    return NextResponse.json({
      msg: "Seat deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete seat error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}