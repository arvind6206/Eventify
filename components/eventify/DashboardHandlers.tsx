import { FormEvent } from "react";
import { api, apiMessage } from "../../lib/api";
import { TicketType, Reservation, UserRole } from "./types";

export interface DashboardHandlersProps {
  authMode: "login" | "register" | null;
  setAuthMode: (mode: "login" | "register" | null) => void;
  setToken: (token: string | null) => void;
  setUserRole: (role: UserRole) => void;
  ticketEventId: string | null;
  seatVenueId: string | null;
  setTicketEventId: (id: string | null) => void;
  setShowEventForm: (show: boolean) => void;
  setShowVenueForm: (show: boolean) => void;
  setShowSeatForm: (show: boolean) => void;
  setSeatVenueId: (id: string | null) => void;
  setNotice: (notice: { kind: "error" | "success"; text: string } | null) => void;
  setPaymentReservation: (reservation: Reservation | null) => void;
  setShowPaymentForm: (show: boolean) => void;
  setTicketTypes: (types: TicketType[]) => void;
  setBookingEventId: (id: string | null) => void;
  refreshWorkspace: () => Promise<void>;
}

export function createDashboardHandlers(props: DashboardHandlersProps) {
  const {
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
  } = props;

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
      await refreshWorkspace();
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
      setTicketTypes(response.data.tickets || []);
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
      const response = await api.post("/api/payments", { 
        reservationId: data.reservationId,
        method: data.method 
      });
      
      // Check if payment was processed successfully
      if (response.data.success && response.data.booking) {
        const ticketCount = response.data.tickets?.length || 0;
        setNotice({ 
          kind: "success", 
          text: `Payment processed successfully! Your booking is confirmed. ${ticketCount} ticket(s) generated.` 
        });
      } else if (response.data.payment && response.data.payment.status === "SUCCESS") {
        setNotice({ kind: "success", text: "Payment successful! Your booking is confirmed." });
      } else {
        setNotice({ kind: "success", text: "Payment initiated. Your booking will be confirmed shortly." });
      }
      
      setShowPaymentForm(false);
      setPaymentReservation(null);
      await refreshWorkspace();
    } catch (error) {
      setNotice({ kind: "error", text: apiMessage(error) });
      throw error;
    }
  }

  return {
    submitAuth,
    submitEvent,
    submitTicket,
    submitVenue,
    submitSeat,
    fetchTicketTypes,
    submitReservation,
    submitPayment,
  };
}