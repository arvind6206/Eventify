import * as z from 'zod'

export const TicketSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be greater than 0"),
    quantity: z.number().int().nonnegative("Quantity must be a non-negative integer")
})