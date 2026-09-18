import { EventRecord, Booking, Ticket, UserRole } from "./types";
import { formatMoney, formatDate } from "./ui";

interface AdminOverviewProps {
  events: EventRecord[];
  bookings: Booking[];
  tickets?: Ticket[];
  adminAnalytics?: any;
  onCreate?: () => void;
}

export function AdminOverview({ events, bookings, tickets = [], adminAnalytics, onCreate }: AdminOverviewProps) {
  if (!adminAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  const { overview, revenueByEvent } = adminAnalytics;

  return (
    <>
      <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-violet-200 font-medium">Admin Dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Platform Overview
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Real-time analytics for your entire Eventify platform.
            </p>
          </div>
          {onCreate && (
            <button
              onClick={onCreate}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-violet-100 transition-colors"
            >
              + Create event
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            💰
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {formatMoney(overview.totalRevenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Total Revenue</p>
          <p className="mt-1 text-xs text-slate-400">From all confirmed bookings</p>
        </div>
        
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            📋
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.confirmedBookings}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Confirmed Bookings</p>
          <p className="mt-1 text-xs text-slate-400">{overview.pendingBookings} pending</p>
        </div>
        
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
            🎫
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.activeTickets}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Active Tickets</p>
          <p className="mt-1 text-xs text-slate-400">{overview.usedTickets} used</p>
        </div>
        
        <div className="rounded-[1.35rem border border-slate-200 bg-white p-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            ✅
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.successfulPayments}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Successful Payments</p>
          <p className="mt-1 text-xs text-slate-400">{overview.pendingPayments} pending</p>
        </div>
      </div>
      
      {/* Revenue by Event */}
      {revenueByEvent && revenueByEvent.length > 0 && (
        <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Revenue by Event</h2>
              <p className="mt-1 text-sm text-slate-500">
                Top performing events by revenue
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Event</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Bookings</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Tickets Sold</th>
                </tr>
              </thead>
              <tbody>
                {revenueByEvent.slice(0, 5).map((event: any) => (
                  <tr key={event.eventId} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{event.eventTitle}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-600">{formatMoney(event.revenue)}</td>
                    <td className="py-3 px-4 text-sm text-right text-slate-600">{event.bookings}</td>
                    <td className="py-3 px-4 text-sm text-right text-slate-600">{event.ticketsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-semibold">Recent Bookings</h2>
            <p className="text-sm text-slate-500">Latest confirmed bookings across the platform</p>
          </div>
          {adminAnalytics.recentBookings && adminAnalytics.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {adminAnalytics.recentBookings.slice(0, 5).map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{booking.event?.title || "Unknown event"}</p>
                    <p className="text-xs text-slate-500">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{formatMoney(booking.totalAmount)}</p>
                    <p className="text-xs text-slate-500">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No recent bookings</p>
          )}
        </div>
        
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-semibold">Recent Tickets</h2>
            <p className="text-sm text-slate-500">Latest tickets generated</p>
          </div>
          {adminAnalytics.recentTickets && adminAnalytics.recentTickets.length > 0 ? (
            <div className="space-y-3">
              {adminAnalytics.recentTickets.slice(0, 5).map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{ticket.booking?.event?.title || "Unknown event"}</p>
                    <p className="text-xs text-slate-500">{ticket.ticketCode}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                      ticket.status === "USED" ? "bg-slate-100 text-slate-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No recent tickets</p>
          )}
        </div>
      </div>
    </>
  );
}