import * as z from 'zod'

export const BookingSchema = z.object({
    reservationId: z.string().uuid()
})