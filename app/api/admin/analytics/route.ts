import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          msg: "Access denied. Admin only.",
        },
        { status: 403 }
      );
    }

    // Get all events
    const allEvents = await prismaClient.event.findMany({
      include: {
        ticketTypes: true
      }
    });

    // Get all bookings
    const allBookings = await prismaClient.booking.findMany({
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get all tickets
    const allTickets = await prismaClient.ticket.findMany({
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
      },
      orderBy: {
        issuedAt: "desc"
      }
    });

    // Get all payments
    const allPayments = await prismaClient.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get all users
    const allUsers = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get all venues
    const allVenues = await prismaClient.venue.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculate analytics
    const totalRevenue = allBookings
      .filter(b => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    const confirmedBookings = allBookings.filter(b => b.status === "CONFIRMED").length;
    const pendingBookings = allBookings.filter(b => b.status === "PENDING").length;
    const cancelledBookings = allBookings.filter(b => b.status === "CANCELLED").length;

    const activeTickets = allTickets.filter(t => t.status === "ACTIVE").length;
    const usedTickets = allTickets.filter(t => t.status === "USED").length;
    const cancelledTickets = allTickets.filter(t => t.status === "CANCELLED").length;

    const successfulPayments = allPayments.filter(p => p.status === "SUCCESS").length;
    const pendingPayments = allPayments.filter(p => p.status === "PENDING").length;

    const publishedEvents = allEvents.filter(e => e.status === "PUBLISHED").length;
    const draftEvents = allEvents.filter(e => e.status === "DRAFT").length;
    const cancelledEvents = allEvents.filter(e => e.status === "CANCELLED").length;

    const totalUsers = allUsers.length;
    const totalOrganizers = allUsers.filter(u => u.role === "ORGANIZER").length;
    const totalVenues = allVenues.length;

    // Revenue by event
    const revenueByEvent = allEvents.map(event => {
      const eventBookings = allBookings.filter(b => b.eventId === event.id && b.status === "CONFIRMED");
      const eventRevenue = eventBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
      const eventTicketsSold = allTickets.filter(t => t.booking?.eventId === event.id).length;
      
      return {
        eventId: event.id,
        eventTitle: event.title,
        revenue: eventRevenue,
        bookings: eventBookings.length,
        ticketsSold: eventTicketsSold
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      msg: "Admin analytics fetched successfully",
      analytics: {
        overview: {
          totalRevenue,
          totalEvents: allEvents.length,
          publishedEvents,
          draftEvents,
          cancelledEvents,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          activeTickets,
          usedTickets,
          cancelledTickets,
          successfulPayments,
          pendingPayments,
          totalUsers,
          totalOrganizers,
          totalVenues
        },
        revenueByEvent,
        recentBookings: allBookings.slice(0, 10),
        recentTickets: allTickets.slice(0, 10),
        recentPayments: allPayments.slice(0, 10),
        recentUsers: allUsers.slice(0, 10),
        recentVenues: allVenues.slice(0, 10)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}