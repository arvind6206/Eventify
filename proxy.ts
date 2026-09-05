import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function proxy(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ msg: "token is missing" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    await jwtVerify(token, jwtSecret)

    return NextResponse.next()
  } catch (error) {
    return NextResponse.json({ msg: "Invalid or expired token" }, { status: 401 })
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
}