import { z } from "zod";

export const ValidateTicketSchema = z.object({
    ticketCode: z.string().min(1, "Ticket code is required")
});