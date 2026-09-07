import * as z from "zod";

export const EventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.enum([
    "CONCERT",
    "SPORTS",
    "CONFERENCE",
    "COMEDY",
    "THEATRE",
    "WORKSHOP",
    "OTHER",
  ]),

  status: z.enum(["AVAILABLE", "RESERVED", "BOOKED"]),

  startTime: z.coerce.date(),
  sendTime: z.coerce.date(),

  venueId: z.string().uuid(),

  imageUrl: z.string().optional(),
});
