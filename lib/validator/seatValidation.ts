import * as z from 'zod'

const typeSchema = z.enum(['REGULAR', 'PREMIUM', 'VIP'])

export const SeatSchema = z.object({
    row: z.string(),
    number: z.number(),
    section: z.string().optional(),
    type: typeSchema,
})