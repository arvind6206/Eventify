export type WorkspaceView = "overview" | "events" | "venues" | "bookings" | "tickets";

export type Notice = { kind: "error" | "success"; text: string } | null;

export type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  description?: string | null;
};

export type EventRecord = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  startTime: string;
  endTime: string;
  venueId: string;
  imageUrl?: string | null;
};

export type Booking = {
  id: string;
  status: string;
  totalAmount: number | string;
  createdAt: string;
  event?: EventRecord;
};

export type Reservation = {
  id: string;
  status: string;
  expiresAt: string;
  quantity: number;
};

export type Ticket = {
  id: string;
  ticketCode: string;
  status: string;
  issuedAt: string;
  booking?: { event?: EventRecord };
};
