import * as z from 'zod'

export const BookingSchema = z.object({
    reservatioId: z.string().uuid()
})