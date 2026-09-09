import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../../lib/db";
import { TicketSchema } from "../../../../../../lib/validator/ticketValidation";
import { getUserIdFromRequest } from "../../../../../../lib/getuserId";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> },
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

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "user not found",
        },
        { status: 404 },
      );
    }

    if (user.role === "USER") {
      return NextResponse.json(
        {
          msg: "user not allowed to update tickets",
        },
        { status: 400 },
      );
    }
    const { id, ticketId } = await params;
    if (!id || !ticketId) {
      return NextResponse.json(
        {
          msg: "id and ticketId are required",
        },
        { status: 400 },
      );
    }

    let findEvent

   if(user.role === 'ADMIN'){
    findEvent = await prismaClient.event.findFirst({
        where: {id}
    })
   } else {
    findEvent = await prismaClient.event.findFirst({
        where: {
            id,
            organizerId: userId
        }
    })
   }

    if (!findEvent) {
      return NextResponse.json(
        {
          msg: "Event not found",
        },
        { status: 404 },
      );
    }

    const findTicket = await prismaClient.ticketType.findFirst({
      where: {
        id: ticketId,
        eventId: id,
      },
    });

    if (!findTicket) {
      return NextResponse.json(
        {
          msg: "ticket not found",
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
    const updatedTicket = await prismaClient.ticketType.update({
      where: {
        id: ticketId,
      },
      data: result.data
    });

    return NextResponse.json(
      {
        msg: "ticket updated Successfully",
        updatedTicket,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        msg: "Intrenal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> },
) {
  try {
    const { id, ticketId } = await params;
    if (!id || !ticketId) {
      return NextResponse.json(
        {
          msg: "eventId and ticketId is required",
        },
        { status: 400 },
      );
    }

    const findEvent = await prismaClient.event.findUnique({
      where: {
        id,
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

    const findTicket = await prismaClient.ticketType.findFirst({
      where: {
        id: ticketId,
        eventId: id,
      },
    });

    if (!findTicket) {
      return NextResponse.json(
        {
          msg: "Ticket not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        msg: "ticket fetched successfully",
        findTicket,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> },
) {
  try {
    const userId = await getUserIdFromRequest(req)
    if(!userId){
        return NextResponse.json({
            msg: "Unauthorized"
        }, {status: 404})
    }

    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        }
    })

    if(!user){
        return NextResponse.json({
            msg: "user not found"
        }, {status: 404})
    }

    if(user.role === 'USER'){
        return NextResponse.json({
            msg: "user not allowed to delete"
        }, {status: 400})
    }

    const { id, ticketId } = await params;
    if (!id || !ticketId) {
      return NextResponse.json(
        {
          msg: "eventId and ticketId is required",
        },
        { status: 400 },
      );
    }

    const findEvent = await prismaClient.event.findUnique({
      where: {
        id,
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

    const findTicket = await prismaClient.ticketType.findFirst({
      where: {
        id: ticketId,
      },
    });

    if (!findTicket) {
      return NextResponse.json(
        {
          msg: "Ticket not found",
        },
        { status: 404 },
      );
    }

    await prismaClient.ticketType.delete({
        where: {
            id: ticketId,
            eventId: id
        }
    })

    return NextResponse.json(
      {
        msg: "ticket deleted successfully",
        findTicket,
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