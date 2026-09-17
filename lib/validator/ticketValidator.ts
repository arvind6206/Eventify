import { z } from "zod";

export const TicketSchema = z.object({
    bookingId: z.string().uuid("A valid booking ID is required")
});

export const ValidateTicketSchema = z.object({
    ticketCode: z.string().min(1, "Ticket code is required")
});
