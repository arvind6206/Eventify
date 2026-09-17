import { Booking, Reservation, Ticket } from "./types";
import { EmptyState, formatDate, formatMoney, Status } from "./ui";

export function BookingsView({
  bookings,
  reservations,
}: {
  bookings: Booking[];
  reservations: Reservation[];
}) {
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
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Bookings</h3>
            <span className="text-sm text-slate-400">{bookings.length}</span>
          </div>
          {bookings.length ? (
            <div className="grid gap-3">
              {bookings.map((item) => (
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
              title="No bookings yet"
              body="Confirmed booking records will show up here."
            />
          )}
        </section>
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Reservations</h3>
            <span className="text-sm text-slate-400">
              {reservations.length}
            </span>
          </div>
          {reservations.length ? (
            <div className="grid gap-3">
              {reservations.map((item) => (
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
                  <Status value={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active history"
              body="Reservations you make through the booking flow will show up here."
            />
          )}
        </section>
      </div>
    </>
  );
}

export function TicketsView({ tickets }: { tickets: Ticket[] }) {
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">My tickets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tickets generated from your confirmed bookings.
        </p>
      </div>
      {tickets.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
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
            title="Your ticket wallet is waiting"
            body="When a confirmed booking has generated tickets, they will appear here with their live status."
          />
        </div>
      )}
    </>
  );
}
