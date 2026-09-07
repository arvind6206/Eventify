import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../../lib/db";
import { SeatSchema } from "../../../../../../lib/validator/seatValidation";
import { getUserIdFromRequest } from "../../../../../../lib/getuserId";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; seatId: string }> },
) {
  try {
    const body = await req.json();
    const { id, seatId } = await params;
    if (!id || !seatId) {
      return NextResponse.json(
        {
          msg: "id and seatId is required",
        },
        { status: 400 },
      );
    }

    const findVenue = await prismaClient.venue.findUnique({
      where: {
        id,
      },
    });

    if (!findVenue) {
      return NextResponse.json(
        {
          msg: "venue not found",
        },
        { status: 400 },
      );
    }

    const findSeat = await prismaClient.seat.findFirst({
      where: {
        venueId: id,
        id: seatId,
      },
    });

    if (!findSeat) {
      return NextResponse.json(
        {
          msg: "seat not found",
        },
        { status: 404 },
      );
    }

    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { msg: "Only admin can delete seats" },
        { status: 403 },
      );
    }
    const result = SeatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const { row, number, section, type } = result.data;

    const updatedSeat = await prismaClient.seat.update({
      where: {
        id: seatId,
      },
      data: {
        row,
        number,
        section,
        type,
      },
    });

    return NextResponse.json({
      msg: "seat updated successfully",
      updatedSeat,
    });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; seatId: string }> },
) {
  try {
    const { id, seatId } = await params;
    if (!id || !seatId) {
      return NextResponse.json(
        {
          msg: "venueId and seatId are required",
        },
        { status: 400 },
      );
    }

    const findVenue = await prismaClient.venue.findUnique({
      where: { id },
    });

    if (!findVenue) {
      return NextResponse.json(
        {
          msg: "venue not found",
        },
        { status: 404 },
      );
    }

    const findSeat = await prismaClient.seat.findFirst({
      where: {
        venueId: id,
        id: seatId,
      },
    });

    if (!findSeat) {
      return NextResponse.json(
        {
          msg: "Seat not found",
        },
        { status: 404 },
      );
    }

    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { msg: "Only admin can delete seats" },
        { status: 403 },
      );
    }

    await prismaClient.seat.delete({
        where: {
            id: seatId
        }
    })

    return NextResponse.json({
        msg: "Seat deleted successfully"
    }, {status: 200})
  } catch (error) {
    console.error(error)
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
