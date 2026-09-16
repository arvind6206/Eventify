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
          msg: "Unauthenticated",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          msg: "ticketId is required",
        },
        { status: 400 },
      );
    }

    const ticket = await prismaClient.ticket.findFirst({
      where: {
        id,
        booking: {
          userId,
        },
      },
      include: {
        booking: {
            include: {
                event: true
            }
        },
        bookingItem: {
            include: {
                ticketType: true,
                eventSeat: {
                    include: {
                        seat: true
                    }
                }
            }
        }
      }
    });

    if(!ticket){
        return NextResponse.json({
            msg: "ticket not found"
        }, {status: 404})
    }

    return NextResponse.json({
        msg: "ticket fetched successfully",
        ticket
    })
  } catch (error) {
    console.error("Error while fetching ticket:", error)
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
