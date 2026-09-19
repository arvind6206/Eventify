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

    const updatedEvent = await prismaClient.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        startTime: body.startTime,
        endTime: body.endTime,
        imageUrl: body.imageUrl
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      msg: "Event updated successfully",
      event: updatedEvent
    }, { status: 200 });

  } catch (error) {
    console.error("Update event error:", error);
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

    // Check if event has active bookings
    const activeBookings = await prismaClient.booking.count({
      where: { 
        eventId: id,
        status: "CONFIRMED"
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json({ 
        msg: "Cannot delete event with active confirmed bookings. Cancel bookings first." 
      }, { status: 409 });
    }

    await prismaClient.event.delete({
      where: { id }
    });

    return NextResponse.json({
      msg: "Event deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}