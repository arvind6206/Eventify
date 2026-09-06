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

    const { payload } = await jwtVerify(token, jwtSecret)

    // forward the userId to the actual route handler via a custom header
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.id as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json({ msg: "Invalid or expired token" }, { status: 401 })
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
}