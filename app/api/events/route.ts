import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";
import prismaClient from "../../../lib/db";
import { EventSchema } from "../../../lib/validator/eventValidation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const organizerId = await getUserIdFromRequest(req);
    if (!organizerId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const findOrganizer = await prismaClient.user.findUnique({
      where: {
        id: organizerId,
      },
    });

    if (!findOrganizer) {
      return NextResponse.json(
        {
          msg: "organizer not found",
        },
        { status: 404 },
      );
    }

    if (findOrganizer.role === "USER") {
      return NextResponse.json({
        msg: "User not allowed to create events",
      });
    }

    const result = EventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      category,
      status,
      startTime,
      endTime,
      venueId,
      imageUrl,
    } = result.data;
    const event = await prismaClient.event.create({
      data: {
        title,
        description,
        category,
        status,
        startTime,
        endTime,
        venueId,
        imageUrl,
        organizerId,
      },
    });

    return NextResponse.json({
      msg: "Event Created Successfully",
      event,
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

export async function GET(req: NextRequest) {
  try {
    const organizerId = await getUserIdFromRequest(req);
    if (!organizerId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const findOrganizer = await prismaClient.user.findUnique({
      where: {
        id: organizerId,
      },
    });

    if (!findOrganizer) {
      return NextResponse.json(
        {
          msg: "organizer not found",
        },
        { status: 404 },
      );
    }

    

    const findEvents = await prismaClient.event.findMany({
      where: {
        organizerId: organizerId,
      },
    });

    if (findEvents.length === 0) {
      return NextResponse.json(
        {
          msg: "Events not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        msg: "Events fetched successfully",
        findEvents,
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
