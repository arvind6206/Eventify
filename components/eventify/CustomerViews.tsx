import { useState } from "react";
import { Booking, Reservation, Ticket } from "./types";
import { EmptyState, formatDate, formatMoney, Status } from "./ui";
import { Button } from "../ui/button";

export function BookingsView({
  bookings,
  reservations,
  onPay,
}: {
  bookings: Booking[];
  reservations: Reservation[];
  onPay: (reservation: Reservation) => void;
}) {
  const [search, setSearch] = useState("");
  
  const filteredBookings = bookings.filter(booking =>
    `${booking.event?.title ?? ""} ${booking.status}`.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredReservations = reservations.filter(reservation =>
    `${reservation.event?.title ?? ""} ${reservation.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Bookings & reservations
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A live view of orders from your authenticated account.
        </p>
      </div>
      <div className="mt-6 flex h-11 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <span className="text-slate-400">⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Search bookings or reservations"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Bookings</h3>
            <span className="text-sm text-slate-400">{filteredBookings.length} of {bookings.length}</span>
          </div>
          {filteredBookings.length ? (
            <div className="grid gap-3">
              {filteredBookings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    ₹
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.event?.title ?? "Event booking"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatMoney(item.totalAmount)}
                    </p>
                    <Status value={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={search ? "No bookings match that search" : "No bookings yet"}
              body={search ? "Try a different search term." : "Confirmed booking records will show up here."}
            />
          )}
        </section>
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Reservations</h3>
            <span className="text-sm text-slate-400">
              {filteredReservations.length} of {reservations.length}
            </span>
          </div>
          {filteredReservations.length ? (
            <div className="grid gap-3">
              {filteredReservations.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700">
                    ◷
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {item.quantity} ticket{item.quantity !== 1 ? "s" : ""}{" "}
                      held
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Expires {formatDate(item.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Status value={item.status} />
                    {item.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        onClick={() => onPay(item)}
                        className="text-xs"
                      >
                        Pay now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={search ? "No reservations match that search" : "No active history"}
              body={search ? "Try a different search term." : "Reservations you make through the booking flow will show up here."}
            />
          )}
        </section>
      </div>
    </>
  );
}

export function TicketsView({ tickets }: { tickets: Ticket[] }) {
  const [search, setSearch] = useState("");
  
  const filteredTickets = tickets.filter(ticket =>
    `${ticket.ticketCode} ${ticket.booking?.event?.title ?? ""} ${ticket.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">My tickets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tickets generated from your confirmed bookings.
        </p>
      </div>
      <div className="mt-6 flex h-11 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <span className="text-slate-400">⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Search tickets by code, event, or status"
        />
      </div>
      {filteredTickets.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <article
              key={ticket.id}
              className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"
            >
              <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-100">
                  Eventify ticket
                </p>
                <h3 className="mt-4 truncate text-lg font-semibold">
                  {ticket.booking?.event?.title ?? "Your event"}
                </h3>
                <p className="mt-1 text-sm text-violet-100">
                  Issued {formatDate(ticket.issuedAt)}
                </p>
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="font-mono text-xs text-slate-500">
                    {ticket.ticketCode}
                  </p>
                  <div className="mt-2">
                    <Status value={ticket.status} />
                  </div>
                </div>
                <div className="grid h-12 w-12 grid-cols-4 gap-0.5 rounded-lg bg-slate-950 p-1">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <span
                      key={index}
                      className={index % 3 ? "bg-white" : "bg-slate-950"}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={search ? "No tickets match that search" : "Your ticket wallet is waiting"}
            body={search ? "Try a different search term." : "When a confirmed booking has generated tickets, they will appear here with their live status."}
          />
        </div>
      )}
    </>
  );
}
