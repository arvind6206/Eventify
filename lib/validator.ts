import * as z from 'zod'

const roleSchema = z.enum(['USER', 'ADMIN', 'ORGANIZER'])

export const SignupSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 character"),
    role: roleSchema.optional()
})

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 character"),
})