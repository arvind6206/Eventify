import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";
import { TicketSchema } from "../../../../../lib/validator/ticketValidation";

export async function POST(
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
          msg: "id is required",
        },
        { status: 400 },
      );
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "User not found",
        },
        { status: 404 },
      );
    }

    if (user.role === "USER") {
      return NextResponse.json(
        {
          msg: "user are not allowed to create ticket",
        },
        { status: 400 },
      );
    }

    const findEvent = await prismaClient.event.findFirst({
      where: {
        id,
        organizerId: userId,
      },
    });

    if (!findEvent) {
      return NextResponse.json(
        {
          msg: "Event not found",
        },
        { status: 404 },
      );
    }

    const body = await req.json();
    const result = TicketSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: result.error.flatten().fieldErrors,
      });
    }

    const { name, description, price, quantity } = result.data;
    const ticket = await prismaClient.ticketType.create({
      data: {
        name,
        eventId: id,
        description,
        price,
        quantity,
      },
    });

    return NextResponse.json(
      {
        msg: "ticket created successfully",
        ticket
      },
      { status: 201 },
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
