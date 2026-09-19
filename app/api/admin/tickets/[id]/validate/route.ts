import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../../lib/getuserId";
import prismaClient from "../../../../../../lib/db";

export async function POST(
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

    const ticket = await prismaClient.ticket.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            event: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        bookingItem: {
          include: {
            ticketType: true
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ msg: "Ticket not found" }, { status: 404 });
    }

    // Update ticket status to USED if it's ACTIVE
    if (ticket.status === "ACTIVE") {
      const updatedTicket = await prismaClient.ticket.update({
        where: { id },
        data: {
          status: "USED",
          usedAt: new Date(),
          qrScannedAt: new Date()
        },
        include: {
          booking: {
            include: {
              event: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          bookingItem: {
            include: {
              ticketType: true
            }
          }
        }
      });

      return NextResponse.json({
        msg: "Ticket validated successfully",
        ticket: updatedTicket,
        validation: {
          status: "VALID",
          scannedAt: new Date(),
          message: "Ticket scanned and marked as used"
        }
      }, { status: 200 });
    }

    // Ticket already used or cancelled
    let message = "";
    if (ticket.status === "USED") {
      message = "Ticket already used";
    } else if (ticket.status === "CANCELLED") {
      message = "Ticket cancelled";
    }

    return NextResponse.json({
      msg: "Ticket validation completed",
      ticket,
      validation: {
        status: ticket.status,
        scannedAt: ticket.qrScannedAt,
        message
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Validate ticket error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}