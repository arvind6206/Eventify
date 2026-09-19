import { Booking, EventRecord, Reservation, Ticket, Venue, UserRole, WorkspaceView } from "./types";
import { EventsView, OverviewView, VenuesView } from "./WorkspaceViews";
import { BookingsView, TicketsView } from "./CustomerViews";
import { UsersView } from "./AdminViews";

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
  adminAnalytics?: any;
  users?: any[];
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleActive?: (userId: string, isActive: boolean) => void;
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
    adminAnalytics,
    users,
    onRoleChange,
    onDeleteUser,
    onToggleActive,
  } = props;
  
  if (view === "overview")
    return (
      <OverviewView
        events={allEvents}
        bookings={bookings}
        reservations={reservations}
        onCreate={userRole === "USER" ? undefined : createEvent}
        userRole={userRole}
        adminAnalytics={adminAnalytics}
        tickets={tickets}
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
  if (view === "tickets")
    return <TicketsView tickets={tickets} />;
  if (view === "users" && userRole === "ADMIN")
    return <UsersView users={users || []} onRoleChange={onRoleChange || (() => {})} onDeleteUser={onDeleteUser || (() => {})} onToggleActive={onToggleActive || (() => {})} />;
  return null;
}