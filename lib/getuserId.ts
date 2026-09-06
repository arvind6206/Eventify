import { NextRequest } from "next/server"

export function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id")
}