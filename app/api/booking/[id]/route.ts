import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          msg: "bookingId is required",
        },
        { status: 400 },
      );
    }

    const booking = await prismaClient.booking.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        event: true,
        items: {
          include: {
            ticketType: true,
            eventSeat: {
              include: {
                seat: true,
              },
            },
          },
        },
      },
    });

    if (booking) {
      return NextResponse.json(
        {
          msg: "Booking not found",
          booking,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        msg: "Booking fetched successfully",
        booking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
