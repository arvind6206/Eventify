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

    const updatedVenue = await prismaClient.venue.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        capacity: body.capacity
      }
    });

    return NextResponse.json({
      msg: "Venue updated successfully",
      venue: updatedVenue
    }, { status: 200 });

  } catch (error) {
    console.error("Update venue error:", error);
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

    // Check if venue has active events
    const activeEvents = await prismaClient.event.count({
      where: { 
        venueId: id,
        status: { in: ["PUBLISHED", "DRAFT"] }
      }
    });

    if (activeEvents > 0) {
      return NextResponse.json({ 
        msg: "Cannot delete venue with active events. Cancel or complete events first." 
      }, { status: 409 });
    }

    await prismaClient.venue.delete({
      where: { id }
    });

    return NextResponse.json({
      msg: "Venue deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete venue error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}