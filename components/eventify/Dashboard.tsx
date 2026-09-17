"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, apiMessage } from "../../lib/api";
import { AuthModal } from "./AuthModal";
import { BookingsView, TicketsView } from "./CustomerViews";
import { EventForm, TicketForm } from "./EventForms";
import { VenueForm } from "./VenueForm";
import { SeatForm } from "./SeatForm";
import { BookingFlow } from "./BookingFlow";
import { PaymentForm } from "./PaymentForm";
import {
  Booking,
  EventRecord,
  Notice,
  Reservation,
  Ticket,
  TicketType,
  Venue,
  WorkspaceView,
  UserRole,
} from "./types";
import { Brand, primaryButton } from "./ui";
import { EventsView, OverviewView, VenuesView } from "./WorkspaceViews";

const getNavItems = (role: UserRole): { id: WorkspaceView; label: string; icon: string }[] => {
  const allNav = [
    { id: "overview" as WorkspaceView, label: "Overview", icon: "◈" },
    { id: "events" as WorkspaceView, label: "Events", icon: "✦" },
    { id: "venues" as WorkspaceView, label: "Venues", icon: "⌂" },
    { id: "bookings" as WorkspaceView, label: "Bookings", icon: "▣" },
    { id: "tickets" as WorkspaceView, label: "Tickets", icon: "◉" },
  ];

  // All roles can see overview, events, bookings, tickets
  // Only ADMIN can see venues
  if (role === "ADMIN") {
    return allNav;
  }
  
  // USER and ORGANIZER cannot see venues
  return allNav.filter(item => item.id !== "venues");
};

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("USER");
  const [view, setView] = useState<WorkspaceView>("overview");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [showSeatForm, setShowSeatForm] = useState(false);
  const [seatVenueId, setSeatVenueId] = useState<string | null>(null);
  const [ticketEventId, setTicketEventId] = useState<string | null>(null);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentReservation, setPaymentReservation] = useState<Reservation | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");

  const refreshWorkspace = useCallback(async () => {
    setLoading(true);
    const [venue, event, booking, reservation, ticket] =
      await Promise.allSettled([
        api.get("/api/venue"),
        api.get("/api/events"),
        api.get("/api/booking"),
        api.get("/api/reservations"),
        api.get("/api/tickets"),
      ]);
    if (venue.status === "fulfilled") {
      const venuesData = venue.value.data.venues ?? [];
      const venuesWithSeats = await Promise.all(
        venuesData.map(async (venue: Venue) => {
          try {
            const seatsResponse = await api.get(`/api/venue/${venue.id}/seat`);
            return { ...venue, seats: seatsResponse.data.seats || [] };
          } catch {
            return { ...venue, seats: [] };
          }
        })
      );
      setVenues(venuesWithSeats);
    }
    if (event.status === "fulfilled")
      setEvents(event.value.data.findEvents ?? []);
    if (booking.status === "fulfilled")
      setBookings(booking.value.data.findBooking ?? []);
    if (reservation.status === "fulfilled")
      setReservations(reservation.value.data.getReservations ?? []);
    if (ticket.status === "fulfilled")
      setTickets(ticket.value.data.tickets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("eventify-token");
    if (savedToken) {
      setToken(savedToken);
      // Fetch user role
      api.get("/api/auth/me")
        .then(response => {
          setUserRole(response.data.user.role);
        })
        .catch(() => {
          setUserRole("USER");
        });
      void refreshWorkspace();
    }
  }, [refreshWorkspace]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        `${event.title} ${event.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [events, search],
  );

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      if (authMode === "register") {
        await api.post("/api/auth/register", {
          name: data.get("name"),
          email: data.get("email"),
          password: data.get("password"),
          role: data.get("role"),
        });
        setAuthMode("login");
        setNotice({
          kind: "success",
          text: "Account created. Sign in to access your workspace.",
        });
        return;
      }
      const response = await api.post("/api/auth/login", {
        email: data.get("email"),
        password: data.get("password"),
      });
      window.localStorage.setItem("eventify-token", response.data.token);
      setToken(response.data.token);
      
      // Fetch user role after login
      try {
        const userResponse = await api.get("/api/auth/me");
        setUserRole(userResponse.data.user.role);
      } catch {
        setUserRole("USER");
      }
      
      setAuthMode(null);
      setNotice({
        kind: "success",
        text: "Welcome back — your live workspace has been loaded.",
      });
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.post("/api/events", {
        title: data.get("title"),
        description: data.get("description") || undefined,
        category: data.get("category"),
        status: data.get("status"),
        startTime: data.get("startTime"),
        endTime: data.get("endTime"),
        venueId: data.get("venueId"),
        imageUrl: data.get("imageUrl") || undefined,
      });
      setShowEventForm(false);
      setNotice({ kind: "success", text: "Event created successfully." });
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticketEventId) return;
    const data = new FormData(event.currentTarget);
    try {
      await api.post(`/api/events/${ticketEventId}/ticket-types`, {
        name: data.get("name"),
        description: data.get("description") || undefined,
        price: Number(data.get("price")),
        quantity: Number(data.get("quantity")),
      });
      setTicketEventId(null);
      setNotice({ kind: "success", text: "Ticket type added successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function submitVenue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.post("/api/venue", {
        name: data.get("name"),
        description: data.get("description") || undefined,
        address: data.get("address"),
        city: data.get("city"),
        state: data.get("state"),
        country: data.get("country"),
        postalCode: data.get("postalCode"),
        capacity: Number(data.get("capacity")),
      });
      setShowVenueForm(false);
      setNotice({ kind: "success", text: "Venue created successfully." });
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function submitSeat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seatVenueId) return;
    const data = new FormData(event.currentTarget);
    try {
      await api.post(`/api/venue/${seatVenueId}/seat`, {
        row: data.get("row"),
        number: Number(data.get("number")),
        section: data.get("section") || undefined,
        type: data.get("type"),
      });
      setShowSeatForm(false);
      setSeatVenueId(null);
      setNotice({ kind: "success", text: "Seat added successfully." });
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function fetchTicketTypes(eventId: string) {
    try {
      const response = await api.get(`/api/events/${eventId}/ticket-types`);
      setTicketTypes(response.data.ticketTypes || []);
      setBookingEventId(eventId);
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
    }
  }

  async function submitReservation(data: { eventId: string; ticketTypeId: string; quantity: number }) {
    try {
      const response = await api.post("/api/reservations", data);
      setNotice({ kind: "success", text: "Reservation created successfully. Complete payment to confirm booking." });
      setPaymentReservation(response.data.reservation);
      setShowPaymentForm(true);
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
      throw error;
    }
  }

  async function submitPayment(data: { reservationId: string; method: string }) {
    try {
      await api.post("/api/payments", { reservationId: data.reservationId });
      setNotice({ kind: "success", text: "Payment successful! Your booking is confirmed." });
      setShowPaymentForm(false);
      setPaymentReservation(null);
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
      throw error;
    }
  }

  function logout() {
    window.localStorage.removeItem("eventify-token");
    setToken(null);
    setEvents([]);
    setBookings([]);
    setReservations([]);
    setTickets([]);
    setNotice(null);
  }

  if (!token)
    return (
      <Landing
        openAuth={setAuthMode}
        authMode={authMode}
        close={() => setAuthMode(null)}
        submit={submitAuth}
        notice={notice}
      />
    );

  return (
    <main className="min-h-screen bg-[#f8f8fb] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar view={view} setView={setView} logout={logout} userRole={userRole} />
        <section className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
          <WorkspaceHeader
            view={view}
            setView={setView}
            refresh={refreshWorkspace}
            userRole={userRole}
          />
          <NoticeBanner notice={notice} dismiss={() => setNotice(null)} />
          <div className="mt-7">
            {loading ? (
              <Loading />
            ) : (
              <WorkspaceContent
                view={view}
                events={filteredEvents}
                allEvents={events}
                venues={venues}
                bookings={bookings}
                reservations={reservations}
                tickets={tickets}
                search={search}
                setSearch={setSearch}
                userRole={userRole}
                createEvent={() => setShowEventForm(true)}
                createTicket={setTicketEventId}
                createVenue={() => setShowVenueForm(true)}
                addSeat={(venueId) => {
                  setSeatVenueId(venueId);
                  setShowSeatForm(true);
                }}
                bookEvent={(eventId) => fetchTicketTypes(eventId)}
                onPay={(reservation) => {
                  setPaymentReservation(reservation);
                  setShowPaymentForm(true);
                }}
              />
            )}
          </div>
        </section>
      </div>
      {showEventForm && (
        <EventForm
          venues={venues}
          close={() => setShowEventForm(false)}
          submit={submitEvent}
        />
      )}
      {ticketEventId && (
        <TicketForm
          event={events.find((item) => item.id === ticketEventId)}
          close={() => setTicketEventId(null)}
          submit={submitTicket}
        />
      )}
      {showVenueForm && (
        <VenueForm
          close={() => setShowVenueForm(false)}
          submit={submitVenue}
        />
      )}
      {showSeatForm && seatVenueId && (
        <SeatForm
          venueId={seatVenueId}
          close={() => {
            setShowSeatForm(false);
            setSeatVenueId(null);
          }}
          submit={submitSeat}
        />
      )}
      {bookingEventId && (
        <BookingFlow
          event={events.find((e) => e.id === bookingEventId)!}
          ticketTypes={ticketTypes}
          close={() => {
            setBookingEventId(null);
            setTicketTypes([]);
          }}
          submitReservation={submitReservation}
        />
      )}
      {showPaymentForm && paymentReservation && (
        <PaymentForm
          reservation={paymentReservation}
          close={() => {
            setShowPaymentForm(false);
            setPaymentReservation(null);
          }}
          submitPayment={submitPayment}
        />
      )}
    </main>
  );
}

function Sidebar({
  view,
  setView,
  logout,
  userRole,
}: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  logout: () => void;
  userRole: UserRole;
}) {
  const nav = getNavItems(userRole);
  
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
      <Brand />
      <div className="mt-10 grid gap-1">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${view === item.id ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-sm font-semibold">You're connected as {userRole}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          All information in this workspace comes from your Eventify API.
        </p>
        <button
          onClick={logout}
          className="mt-4 text-xs font-semibold text-violet-300 hover:text-white"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
function WorkspaceHeader({
  view,
  setView,
  refresh,
  userRole,
}: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  refresh: () => Promise<void>;
  userRole: UserRole;
}) {
  const nav = getNavItems(userRole);
  
  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm text-slate-500">Eventify workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {nav.find((item) => item.id === view)?.label}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void refresh()}
            className="hidden h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:text-violet-700 sm:block"
          >
            ↻ Refresh
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
            EV
          </div>
        </div>
      </header>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${view === item.id ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
function NoticeBanner({
  notice,
  dismiss,
}: {
  notice: Notice;
  dismiss: () => void;
}) {
  return notice ? (
    <div
      className={`mt-6 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
    >
      <span>{notice.text}</span>
      <button onClick={dismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  ) : null;
}
function Loading() {
  return (
    <div className="grid min-h-[28rem] place-items-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        Refreshing your workspace…
      </div>
    </div>
  );
}
function WorkspaceContent(props: {
  view: WorkspaceView;
  events: EventRecord[];
  allEvents: EventRecord[];
  venues: Venue[];
  bookings: Booking[];
  reservations: Reservation[];
  tickets: Ticket[];
  search: string;
  setSearch: (value: string) => void;
  userRole: UserRole;
  createEvent: () => void;
  createTicket: (id: string) => void;
  createVenue: () => void;
  addSeat: (venueId: string) => void;
  bookEvent: (eventId: string) => void;
  onPay: (reservation: Reservation) => void;
}) {
  const {
    view,
    events,
    allEvents,
    venues,
    bookings,
    reservations,
    tickets,
    search,
    setSearch,
    userRole,
    createEvent,
    createTicket,
    createVenue,
    addSeat,
    bookEvent,
    onPay,
  } = props;
  if (view === "overview")
    return (
      <OverviewView
        events={allEvents}
        bookings={bookings}
        reservations={reservations}
        onCreate={userRole === "USER" ? undefined : createEvent}
        userRole={userRole}
      />
    );
  if (view === "events")
    return (
      <EventsView
        events={events}
        venues={venues}
        search={search}
        onSearch={setSearch}
        onCreate={userRole === "USER" ? undefined : createEvent}
        onTicket={userRole === "USER" ? undefined : createTicket}
        onBook={bookEvent}
        userRole={userRole}
      />
    );
  if (view === "venues") return <VenuesView venues={venues} onCreate={userRole === "ADMIN" ? createVenue : undefined} onAddSeat={userRole === "ADMIN" ? addSeat : undefined} userRole={userRole} />;
  if (view === "bookings")
    return <BookingsView bookings={bookings} reservations={reservations} onPay={onPay} />;
  return <TicketsView tickets={tickets} />;
}
function Landing({
  openAuth,
  authMode,
  close,
  submit,
  notice,
}: {
  openAuth: (mode: "login" | "register" | null) => void;
  authMode: "login" | "register" | null;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  notice: Notice;
}) {
  return (
    <main className="min-h-screen bg-[#f8f7ff] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top_right,_#d9ccff_0%,_transparent_52%),radial-gradient(ellipse_at_top_left,_#bfe6ff_0%,_transparent_42%)]" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Brand />
        <button
          onClick={() => openAuth("login")}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5"
        >
          Sign in
        </button>
      </nav>
      
      {/* Hero Section */}
      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.12fr_.88fr] lg:px-10 lg:pt-24">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
            EVENT OPERATIONS, MADE BEAUTIFUL
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-.055em] text-slate-950 sm:text-6xl">
            Every great event starts with a clear view.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Plan events, manage tickets, and keep an eye on every booking from
            one calm, connected workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={() => openAuth("register")}
              className={primaryButton}
            >
              Create your workspace&nbsp; →
            </button>
            <button
              onClick={() => openAuth("login")}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              I already have an account
            </button>
          </div>
        </div>
        <PreviewCard />
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need to manage events
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From venue management to ticket sales, Eventify handles it all.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "⌂",
              title: "Venue Management",
              description: "Create and manage venues with detailed seat layouts and capacity tracking."
            },
            {
              icon: "✦",
              title: "Event Creation",
              description: "Set up events with multiple ticket types, pricing tiers, and scheduling."
            },
            {
              icon: "◉",
              title: "Ticket Management",
              description: "Generate unique QR codes for tickets with real-time validation and tracking."
            },
            {
              icon: "▣",
              title: "Booking System",
              description: "Streamlined booking flow with payment integration and reservation management."
            },
            {
              icon: "◷",
              title: "Real-time Analytics",
              description: "Track bookings, revenue, and attendance with live dashboards and reports."
            },
            {
              icon: "⚡",
              title: "Multi-role Access",
              description: "Organizers, admins, and attendees with role-based permissions and workflows."
            }
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-2xl text-violet-700">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            How Eventify works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get started in minutes with our simple workflow
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create your account",
              description: "Sign up as an organizer, admin, or attendee to get started with your workspace."
            },
            {
              step: "02",
              title: "Set up your venue",
              description: "Add venues and configure seat layouts for different event types and capacities."
            },
            {
              step: "03",
              title: "Launch your event",
              description: "Create events, set ticket prices, and start selling to your audience."
            }
          ].map((step) => (
            <div key={step.step} className="relative">
              <div className="text-6xl font-bold text-violet-200/50">{step.step}</div>
              <div className="absolute top-8 left-0 right-0">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-3xl bg-slate-950 p-12 text-white">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: "10K+", label: "Events Managed" },
              { value: "500K+", label: "Tickets Sold" },
              { value: "98%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Ready to transform your event management?
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Join thousands of organizers who trust Eventify to manage their events seamlessly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => openAuth("register")}
            className={primaryButton}
          >
            Get started for free
          </button>
          <button
            onClick={() => openAuth("login")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in to existing account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 border-t border-slate-200">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Brand />
            <p className="mt-4 text-sm text-slate-600">
              Event operations, beautifully organized.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
              <li>API</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-600">
          © 2024 Eventify. All rights reserved.
        </div>
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          close={close}
          switchMode={() =>
            openAuth(authMode === "login" ? "register" : "login")
          }
          submit={submit}
          notice={notice}
        />
      )}
    </main>
  );
}
function PreviewCard() {
  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_-28px_rgba(62,34,124,.35)] backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
            Your next event
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            A workspace that stays in sync
          </h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-xl">
          ✦
        </span>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex justify-between text-xs text-slate-400">
          <span>EVENTIFY PULSE</span>
          <span>LIVE</span>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            ["24", "Bookings"],
            ["6", "Events"],
            ["98%", "Check-in"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
