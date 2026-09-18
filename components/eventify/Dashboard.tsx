"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
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
import { Sidebar, WorkspaceHeader } from "./DashboardNavigation";
import { NoticeBanner, Loading } from "./DashboardUI";
import { createDashboardHandlers } from "./DashboardHandlers";
import { LandingPage } from "./LandingPage";
import { WorkspaceContent } from "./WorkspaceContent";

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
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);

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
    else if (booking.status === "rejected" && booking.reason?.response?.status === 404)
      setBookings([]);
    if (reservation.status === "fulfilled")
      setReservations(reservation.value.data.getReservations ?? []);
    else if (reservation.status === "rejected" && reservation.reason?.response?.status === 404)
      setReservations([]);
    if (ticket.status === "fulfilled")
      setTickets(ticket.value.data.tickets ?? []);
    
    // Fetch admin analytics if user is admin
    if (userRole === "ADMIN") {
      try {
        const analyticsResponse = await api.get("/api/admin/analytics");
        setAdminAnalytics(analyticsResponse.data.analytics);
      } catch (error) {
        console.error("Failed to fetch admin analytics:", error);
        setAdminAnalytics(null);
      }
    }
    
    setLoading(false);
  }, [userRole]);

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

  // Create handlers using the extracted function
  const handlers = createDashboardHandlers({
    authMode,
    setAuthMode,
    setToken,
    setUserRole,
    ticketEventId,
    seatVenueId,
    setTicketEventId,
    setShowEventForm,
    setShowVenueForm,
    setShowSeatForm,
    setSeatVenueId,
    setNotice,
    setPaymentReservation,
    setShowPaymentForm,
    setTicketTypes,
    setBookingEventId,
    refreshWorkspace,
  });

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
      <LandingPage
        openAuth={setAuthMode}
        authMode={authMode}
        close={() => setAuthMode(null)}
        submit={handlers.submitAuth}
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
                bookEvent={(eventId) => handlers.fetchTicketTypes(eventId)}
                onPay={(reservation) => {
                  setPaymentReservation(reservation);
                  setShowPaymentForm(true);
                }}
                adminAnalytics={adminAnalytics}
              />
            )}
          </div>
        </section>
      </div>
      {showEventForm && (
        <EventForm
          venues={venues}
          close={() => setShowEventForm(false)}
          submit={handlers.submitEvent}
        />
      )}
      {ticketEventId && (
        <TicketForm
          event={events.find((item) => item.id === ticketEventId)}
          close={() => setTicketEventId(null)}
          submit={handlers.submitTicket}
        />
      )}
      {showVenueForm && (
        <VenueForm
          close={() => setShowVenueForm(false)}
          submit={handlers.submitVenue}
        />
      )}
      {showSeatForm && seatVenueId && (
        <SeatForm
          venueId={seatVenueId}
          close={() => {
            setShowSeatForm(false);
            setSeatVenueId(null);
          }}
          submit={handlers.submitSeat}
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
          submitReservation={handlers.submitReservation}
          submitPayment={handlers.submitPayment}
        />
      )}
      {showPaymentForm && paymentReservation && (
        <PaymentForm
          reservation={paymentReservation}
          close={() => {
            setShowPaymentForm(false);
            setPaymentReservation(null);
          }}
          submitPayment={handlers.submitPayment}
        />
      )}
    </main>
  );
}
