import { useState } from "react";
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
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  if (!adminAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  const { overview, revenueByEvent, recentBookings, recentTickets, recentUsers, recentPayments, recentVenues } = adminAnalytics;

  const renderMetricDetails = () => {
    switch (selectedMetric) {
      case 'revenue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
            {revenueByEvent && revenueByEvent.length > 0 ? (
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
                    {revenueByEvent.map((event: any) => (
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
            ) : (
              <p className="text-sm text-slate-500">No revenue data available</p>
            )}
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{overview.totalUsers}</p>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{overview.totalOrganizers}</p>
                <p className="text-sm text-slate-600">Organizers</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-600">{overview.totalUsers - overview.totalOrganizers}</p>
                <p className="text-sm text-slate-600">Regular Users</p>
              </div>
            </div>
            {recentUsers && recentUsers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">All Users</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "ADMIN" ? "bg-rose-100 text-rose-700" :
                        user.role === "ORGANIZER" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'events':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Breakdown</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{overview.totalEvents}</p>
                <p className="text-sm text-slate-600">Total Events</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{overview.publishedEvents}</p>
                <p className="text-sm text-slate-600">Published</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-600">{overview.draftEvents}</p>
                <p className="text-sm text-slate-600">Draft</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-rose-600">{overview.cancelledEvents || 0}</p>
                <p className="text-sm text-slate-600">Cancelled</p>
              </div>
            </div>
            {events.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">All Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{event.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(event.startTime)}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                        event.status === "DRAFT" ? "bg-slate-100 text-slate-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'venues':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Venue Details</h3>
            {recentVenues && recentVenues.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentVenues.map((venue: any) => (
                  <div key={venue.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{venue.name}</p>
                        <p className="text-sm text-slate-500">{venue.address}</p>
                        <p className="text-xs text-slate-400">{venue.city}, {venue.state}, {venue.country}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        {venue.capacity} capacity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No venue data available</p>
            )}
          </div>
        );
      
      case 'bookings':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Booking Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{overview.confirmedBookings}</p>
                <p className="text-sm text-slate-600">Confirmed</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{overview.pendingBookings}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-rose-600">{overview.cancelledBookings}</p>
                <p className="text-sm text-slate-600">Cancelled</p>
              </div>
            </div>
            {recentBookings && recentBookings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Bookings</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{booking.event?.title || "Unknown event"}</p>
                        <p className="text-xs text-slate-500">{formatDate(booking.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">{formatMoney(booking.totalAmount)}</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                          booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'tickets':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ticket Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{overview.activeTickets}</p>
                <p className="text-sm text-slate-600">Active</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-slate-600">{overview.usedTickets}</p>
                <p className="text-sm text-slate-600">Used</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-rose-600">{overview.cancelledTickets}</p>
                <p className="text-sm text-slate-600">Cancelled</p>
              </div>
            </div>
            {recentTickets && recentTickets.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Tickets</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentTickets.map((ticket: any) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{ticket.booking?.event?.title || "Unknown event"}</p>
                        <p className="text-xs text-slate-500">{ticket.ticketCode}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                        ticket.status === "USED" ? "bg-slate-100 text-slate-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'payments':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{overview.successfulPayments}</p>
                <p className="text-sm text-slate-600">Successful</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{overview.pendingPayments}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-rose-600">{overview.totalRevenue > 0 ? Math.round((overview.successfulPayments / (overview.successfulPayments + overview.pendingPayments)) * 100) : 0}%</p>
                <p className="text-sm text-slate-600">Success Rate</p>
              </div>
            </div>
            {recentPayments && recentPayments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Payments</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{payment.user?.name || "Unknown user"}</p>
                        <p className="text-xs text-slate-500">{formatDate(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">{formatMoney(payment.amount)}</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" :
                          payment.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'organizers':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Organizer Details</h3>
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-2xl font-bold text-blue-600">{overview.totalOrganizers}</p>
              <p className="text-sm text-slate-600">Total Organizers</p>
            </div>
            {recentUsers && recentUsers.filter((u: any) => u.role === "ORGANIZER").length > 0 ? (
              <div>
                <h4 className="font-medium mb-2">All Organizers</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentUsers.filter((u: any) => u.role === "ORGANIZER").map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        ORGANIZER
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No organizers found</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

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
        <div 
          className="rounded-[1.35rem] border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('revenue')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            💰
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {formatMoney(overview.totalRevenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Total Revenue</p>
          <p className="mt-1 text-xs text-slate-400">From all confirmed bookings</p>
        </div>
        
        <div 
          className="rounded-[1.35rem] border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('users')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            👥
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.totalUsers}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Total Users</p>
          <p className="mt-1 text-xs text-slate-400">{overview.totalOrganizers} organizers</p>
        </div>
        
        <div 
          className="rounded-[1.35rem] border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('events')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
            🎪
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.totalEvents}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Total Events</p>
          <p className="mt-1 text-xs text-slate-400">{overview.publishedEvents} published</p>
        </div>
        
        <div 
          className="rounded-[1.35rem border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('venues')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            🏟️
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.totalVenues}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Total Venues</p>
          <p className="mt-1 text-xs text-slate-400">Available locations</p>
        </div>
      </div>
      
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div 
          className="rounded-[1.35rem] border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('bookings')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
            📋
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.confirmedBookings}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Confirmed Bookings</p>
          <p className="mt-1 text-xs text-slate-400">{overview.pendingBookings} pending</p>
        </div>
        
        <div 
          className="rounded-[1.35rem] border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('tickets')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
            🎫
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.activeTickets}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Active Tickets</p>
          <p className="mt-1 text-xs text-slate-400">{overview.usedTickets} used</p>
        </div>
        
        <div 
          className="rounded-[1.35rem border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('payments')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            ✅
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.successfulPayments}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Successful Payments</p>
          <p className="mt-1 text-xs text-slate-400">{overview.pendingPayments} pending</p>
        </div>
        
        <div 
          className="rounded-[1.35rem border border-slate-200 bg-white p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 transition-all"
          onClick={() => setSelectedMetric('organizers')}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            👤
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {overview.totalOrganizers}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">Organizers</p>
          <p className="mt-1 text-xs text-slate-400">Event creators</p>
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
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-semibold">Recent Users</h2>
            <p className="text-sm text-slate-500">Latest registered users</p>
          </div>
          {adminAnalytics.recentUsers && adminAnalytics.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {adminAnalytics.recentUsers.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "ADMIN" ? "bg-rose-100 text-rose-700" :
                      user.role === "ORGANIZER" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No recent users</p>
          )}
        </div>
      </div>
      
      {/* Details Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm" 
            onClick={() => setSelectedMetric(null)}
          />
          <div className="relative z-50 w-full max-w-4xl max-h-[80vh] bg-white rounded-2xl shadow-lg overflow-y-auto m-4">
            <button 
              onClick={() => setSelectedMetric(null)}
              className="absolute right-4 top-4 z-10 rounded-lg p-2 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedMetric === 'revenue' && 'Revenue Details'}
                {selectedMetric === 'users' && 'User Details'}
                {selectedMetric === 'events' && 'Event Details'}
                {selectedMetric === 'venues' && 'Venue Details'}
                {selectedMetric === 'bookings' && 'Booking Details'}
                {selectedMetric === 'tickets' && 'Ticket Details'}
                {selectedMetric === 'payments' && 'Payment Details'}
                {selectedMetric === 'organizers' && 'Organizer Details'}
              </h2>
              {renderMetricDetails()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}