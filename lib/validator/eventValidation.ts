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

  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),

  startTime: z.string(),
  endTime: z.string(),

  venueId: z.string().uuid(),

  imageUrl: z.string().optional(),
});
