import * as z from 'zod'

export const TicketSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number().positive(),
    quantity: z.number()
})