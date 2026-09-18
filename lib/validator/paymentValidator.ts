import {z} from 'zod'

export const PaymentSchema = z.object({
    reservationId: z.string().uuid(),
    method: z.enum(['CARD', 'UPI', 'NET_BANKING', 'WALLET']).optional()
})