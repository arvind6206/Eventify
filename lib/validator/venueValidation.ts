import * as z from 'zod'

export const VenueSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    capacity: z.number(),
    
})