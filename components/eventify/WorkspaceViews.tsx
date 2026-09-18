import { Booking, EventRecord, Reservation, Ticket, Venue, Seat, UserRole } from "./types";
import {
  EmptyState,
  formatDate,
  formatMoney,
  primaryButton,
  Status,
} from "./ui";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AdminOverview } from "./AdminOverview";

export function OverviewView({
  events,
  bookings,
  reservations,
  onCreate,
  userRole,
  adminAnalytics,
  tickets,
}: {
  events: EventRecord[];
  bookings: Booking[];
  reservations: Reservation[];
  onCreate?: () => void;
  userRole: UserRole;
  adminAnalytics?: any;
  tickets?: Ticket[];
}) {
  // Use AdminOverview for admin users
  if (userRole === "ADMIN") {
    return <AdminOverview events={events} bookings={bookings} tickets={tickets} adminAnalytics={adminAnalytics} onCreate={onCreate} />;
  }
  
  const total = bookings
    .filter((item) => item.status === "CONFIRMED")
    .reduce((sum, item) => sum + Number(item.totalAmount), 0);
  const nextEvents = [...events]
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 3);
  
  // Regular user stats
  const stats = [
    [
      String(events.length),
      "All events",
      `${events.filter((item) => item.status === "PUBLISHED").length} published`,
    ],
    [
      String(bookings.filter((item) => item.status === "CONFIRMED").length),
      "Confirmed bookings",
      "From your account",
    ],
    [
      String(reservations.filter((item) => item.status === "ACTIVE").length),
      "Live reservations",
      "Held for 10 minutes",
    ],
    [formatMoney(total), "Booking value", "Confirmed orders"],
  ];
  return (
    <>
      <div className="rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-violet-200">Your event command center</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Make the next moment memorable.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Your workspace is connected to the live Eventify API. Create an
              event, then add ticket types when you’re ready.
            </p>
          </div>
          {onCreate && (
            <button
              onClick={onCreate}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-violet-100"
            >
              + Create event
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([value, label, detail]) => (
          <div
            key={label}
            className="rounded-[1.35rem] border border-slate-200 bg-white p-5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-700">
              ✦
            </span>
            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Upcoming events</h2>
            <p className="mt-1 text-sm text-slate-500">
              What’s happening next in your calendar
            </p>
          </div>
          <span className="text-sm font-medium text-violet-700">
            {events.length} total
          </span>
        </div>
        {nextEvents.length ? (
          <div className="grid gap-3">
            {nextEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  ✦
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {event.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {formatDate(event.startTime)}
                  </p>
                </div>
                <Status value={event.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your calendar is open"
            body="Create your first event to start organizing tickets and attendee flow."
            action={
              <button
                onClick={onCreate}
                className="text-sm font-semibold text-violet-700"
              >
                Create an event →
              </button>
            }
          />
        )}
      </section>
    </>
  );
}

export function EventsView({
  events,
  venues,
  search,
  onSearch,
  onCreate,
  onTicket,
  onBook,
  userRole,
}: {
  events: EventRecord[];
  venues: Venue[];
  search: string;
  onSearch: (value: string) => void;
  onCreate?: () => void;
  onTicket?: (id: string) => void;
  onBook: (id: string) => void;
  userRole: UserRole;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Your events</h2>
          <p className="mt-1 text-sm text-slate-500">
            Build an experience your audience remembers.
          </p>
        </div>
        {onCreate && (
          <button onClick={onCreate} className={primaryButton}>
            + New event
          </button>
        )}
      </div>
      <div className="mt-6 flex h-11 max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <span className="text-slate-400">⌕</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Search events or category"
        />
      </div>
      {events.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              venue={venues.find((venue) => venue.id === event.venueId)}
              onTicket={onTicket}
              onBook={onBook}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title={search ? "No events match that search" : "No events yet"}
            body={
              search
                ? "Try a different event name or category."
                : "Create an event to begin managing ticket types and bookings."
            }
            action={
              !search ? (
                <button
                  onClick={onCreate}
                  className="text-sm font-semibold text-violet-700"
                >
                  Create your first event →
                </button>
              ) : undefined
            }
          />
        </div>
      )}
    </>
  );
}

function EventCard({
  event,
  venue,
  onTicket,
  onBook,
}: {
  event: EventRecord;
  venue?: Venue;
  onTicket: (id: string) => void;
  onBook: (id: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="relative h-40 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-500 p-4">
        {event.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
        )}
        <div className="relative flex justify-between">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
            {event.category}
          </span>
          <Status value={event.status} />
        </div>
        <p className="absolute bottom-4 left-4 rounded-lg bg-black/30 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white">
          {formatDate(event.startTime)}
        </p>
      </div>
      <div className="p-5">
        <h3 className="truncate text-lg font-bold text-slate-900">{event.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-600">
          {event.description || "No description has been added yet."}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="truncate pr-3 text-sm text-slate-500 font-medium">
            {venue?.name ?? "Venue not found"}
          </span>
          <div className="flex gap-2">
            {onTicket && (
              <button
                onClick={() => onTicket(event.id)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-xs font-semibold text-violet-700 hover:from-violet-100 hover:to-purple-100 transition-all"
              >
                Add tickets
              </button>
            )}
            <button
              onClick={() => onBook(event.id)}
              className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:from-emerald-100 hover:to-teal-100 transition-all"
            >
              Book now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VenuesView({ venues, onCreate, onAddSeat, userRole }: { venues: Venue[]; onCreate?: () => void; onAddSeat?: (venueId: string) => void; userRole: UserRole }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Venues</h2>
          <p className="mt-1 text-sm text-slate-500">
            The spaces that bring your events to life.
          </p>
        </div>
        {onCreate && (
          <button onClick={onCreate} className={primaryButton}>
            + New venue
          </button>
        )}
      </div>
      {venues.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <article
              key={venue.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-lg">
                  ⌂
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {venue.capacity.toLocaleString()} capacity
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{venue.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {venue.address}
                <br />
                {venue.city}, {venue.state}, {venue.country}
              </p>
              {venue.description && (
                <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                  {venue.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {venue.seats && venue.seats.length > 0 && (
                  <Badge variant="info">{venue.seats.length} seats</Badge>
                )}
                {onAddSeat && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onAddSeat(venue.id)}
                    className="text-xs"
                  >
                    + Add Seat
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No venues available"
            body="Venues are managed by administrators. Create your first venue to enable event creation."
            action={
              <button
                onClick={onCreate}
                className="text-sm font-semibold text-violet-700"
              >
                Create a venue →
              </button>
            }
          />
        </div>
      )}
    </>
  );
}
