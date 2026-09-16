import {z} from 'zod'

export const TicketSchema = z.object({
    bookingId: z.string().uuid(),
})