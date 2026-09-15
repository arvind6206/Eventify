import {z} from 'zod'

export const PaymentSchema = z.object({
    reservationId: z.string().uuid()
})