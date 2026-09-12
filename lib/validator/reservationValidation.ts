import * as z from 'zod';

export const ReservationSchema = z.object({
    eventSeatId: z.string().uuid().optional(),
    ticketTypeId: z.string().uuid(),
    quantity: z.number().int().positive()
})