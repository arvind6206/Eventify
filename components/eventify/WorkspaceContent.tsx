import { Booking, EventRecord, Reservation, Ticket, Venue, UserRole, WorkspaceView } from "./types";
import { EventsView, OverviewView, VenuesView } from "./WorkspaceViews";
import { BookingsView, TicketsView } from "./CustomerViews";

interface WorkspaceContentProps {
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
}

export function WorkspaceContent(props: WorkspaceContentProps) {
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