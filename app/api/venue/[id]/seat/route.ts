import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../lib/db";
import { SeatSchema } from "../../../../../lib/validator/seatValidation";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { msg: "Venue ID is required" },
        { status: 400 }
      );
    }

    const findVenue = await prismaClient.venue.findUnique({
      where: { id },
    });

    if (!findVenue) {
      return NextResponse.json(
        { msg: "Venue not found" },
        { status: 404 }
      );
    }

    const seats = await prismaClient.seat.findMany({
      where: { venueId: id },
      orderBy: [
        { row: "asc" },
        { number: "asc" }
      ]
    });

    return NextResponse.json(
      {
        msg: "Seats fetched successfully",
        seats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { msg: "Venue ID is required" },
        { status: 400 }
      );
    }

    const findVenue = await prismaClient.venue.findUnique({
      where: { id },
    });

    if (!findVenue) {
      return NextResponse.json(
        { msg: "Venue not found" },
        { status: 404 }
      );
    }

    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { msg: "Only admin can add seats" },
        { status: 403 }
      );
    }

    const result = SeatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { row, number, section, type } = result.data;

    // Check if seat already exists
    const existingSeat = await prismaClient.seat.findFirst({
      where: {
        venueId: id,
        row,
        number,
      },
    });

    if (existingSeat) {
      return NextResponse.json(
        { msg: "Seat already exists in this row" },
        { status: 409 }
      );
    }

    const seat = await prismaClient.seat.create({
      data: {
        venueId: id,
        row,
        number,
        section,
        type,
      },
    });

    return NextResponse.json(
      {
        msg: "Seat created successfully",
        seat,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 }
    );
  }
}